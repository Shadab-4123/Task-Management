import bcrypt
from database import get_db_connection
import json
from psycopg2.extras import Json

def _parse_subtasks(raw_subtasks):
    """
    Normalize subtasks from JSON/JSONB column.
    Depending on driver settings, the value may be returned as a decoded Python object or a JSON string.
    """
    if raw_subtasks is None:
        return []
    # Already decoded JSON
    if isinstance(raw_subtasks, list):
        return raw_subtasks
    if isinstance(raw_subtasks, dict):
        # If it ever comes as a single object, treat it as a 1-element list.
        return [raw_subtasks]
    # Some drivers may return JSON as bytes/memoryview.
    if isinstance(raw_subtasks, (bytes, bytearray, memoryview)):
        try:
            raw_subtasks = raw_subtasks.decode('utf-8')
        except Exception:
            return []

    # JSON string
    if isinstance(raw_subtasks, str):
        s = raw_subtasks.strip()
        if s == "":
            return []
        try:
            parsed = json.loads(s)
        except Exception:
            return []

        # Normal case: JSON array/object
        if isinstance(parsed, list):
            return parsed
        if isinstance(parsed, dict):
            return [parsed]
        if parsed is None:
            return []

        # Defensive: sometimes JSON is double-encoded and comes back as a string
        # containing JSON (e.g. "\"[{...}]\"").
        if isinstance(parsed, str):
            inner = parsed.strip()
            if inner.startswith('[') or inner.startswith('{'):
                try:
                    inner_parsed = json.loads(inner)
                    if isinstance(inner_parsed, list):
                        return inner_parsed
                    if isinstance(inner_parsed, dict):
                        return [inner_parsed]
                except Exception:
                    pass

        return []
    return []

class User:
    @staticmethod
    def create(username, password):
        """Create a new user with hashed password"""
        connection = get_db_connection()
        try:
            hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            
            with connection.cursor() as cursor:
                cursor.execute(
                    "INSERT INTO users (username, password) VALUES (%s, %s) RETURNING id",
                    (username, hashed_password)
                )
                created = cursor.fetchone()
                connection.commit()
                return created['id']
        except Exception as e:
            connection.rollback()
            raise e
        finally:
            connection.close()
    
    @staticmethod
    def authenticate(username, password):
        """Authenticate user and return user data if successful"""
        connection = get_db_connection()
        try:
            with connection.cursor() as cursor:
                cursor.execute(
                    "SELECT id, username, password FROM users WHERE username = %s",
                    (username,)
                )
                user = cursor.fetchone()
                
                if user and bcrypt.checkpw(password.encode('utf-8'), user['password'].encode('utf-8')):
                    return {'id': user['id'], 'username': user['username']}
                return None
        finally:
            connection.close()
    
    @staticmethod
    def get_by_id(user_id):
        """Get user by ID"""
        connection = get_db_connection()
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT id, username FROM users WHERE id = %s", (user_id,))
                return cursor.fetchone()
        finally:
            connection.close()

class Task:
    @staticmethod
    def log_status_change(task_id, old_status, new_status, user_id, notes=None):
        """Log a status change to history"""
        connection = get_db_connection()
        try:
            with connection.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO task_status_history (task_id, old_status, new_status, changed_by, notes)
                    VALUES (%s, %s, %s, %s, %s)
                """, (task_id, old_status, new_status, user_id, notes))
                connection.commit()
        except Exception as e:
            connection.rollback()
            raise e
        finally:
            connection.close()
    
    @staticmethod
    def get_status_history(task_id, user_id):
        """Get status history for a task"""
        connection = get_db_connection()
        try:
            # First verify task belongs to user
            task = Task.get_by_id(task_id, user_id)
            if not task:
                return []
            
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT h.id, h.old_status, h.new_status, h.changed_at, h.notes,
                           u.username as changed_by_username
                    FROM task_status_history h
                    LEFT JOIN users u ON h.changed_by = u.id
                    WHERE h.task_id = %s
                    ORDER BY h.changed_at DESC
                """, (task_id,))
                return cursor.fetchall()
        finally:
            connection.close()
    
    @staticmethod
    def create(user_id, project_name, request_date, status, task_type, delivered_date=None, subtasks=None, description=None):
        """Create a new task"""
        connection = get_db_connection()
        try:
            subtasks_json = Json(subtasks if subtasks else [])
            
            with connection.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO tasks (user_id, project_name, description, request_date, status, task_type, delivered_date, subtasks)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                    RETURNING id
                """, (user_id, project_name, description, request_date, status, task_type, delivered_date, subtasks_json))
                task = cursor.fetchone()
                task_id = task['id']
                
                # Log initial status in the same transaction/connection.
                # Using a second DB connection here can block on FK checks
                # because the new task row is not committed yet.
                if status:
                    cursor.execute("""
                        INSERT INTO task_status_history (task_id, old_status, new_status, changed_by, notes)
                        VALUES (%s, %s, %s, %s, %s)
                    """, (task_id, None, status, user_id, 'Initial status'))
                
                connection.commit()
                return task_id
        except Exception as e:
            connection.rollback()
            raise e
        finally:
            connection.close()
    
    @staticmethod
    def get_all_by_user(user_id):
        """Get all tasks for a user"""
        connection = get_db_connection()
        try:
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT id, project_name, description, request_date, created_date, status, task_type, 
                           delivered_date, subtasks, first_completed_date, last_completed_date, 
                           completion_count, reopened_count
                    FROM tasks
                    WHERE user_id = %s
                    ORDER BY created_date DESC
                """, (user_id,))
                tasks = cursor.fetchall()
                
                # Parse JSON subtasks (driver may return string or decoded object)
                for task in tasks:
                    task['subtasks'] = _parse_subtasks(task.get('subtasks'))
                
                return tasks
        finally:
            connection.close()
    
    @staticmethod
    def get_by_id(task_id, user_id):
        """Get a specific task by ID (ensuring it belongs to user)"""
        connection = get_db_connection()
        try:
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT id, project_name, description, request_date, created_date, status, task_type, 
                           delivered_date, subtasks, first_completed_date, last_completed_date, 
                           completion_count, reopened_count
                    FROM tasks
                    WHERE id = %s AND user_id = %s
                """, (task_id, user_id))
                task = cursor.fetchone()
                
                if task:
                    task['subtasks'] = _parse_subtasks(task.get('subtasks'))
                
                return task
        finally:
            connection.close()
    
    @staticmethod
    def update(task_id, user_id, project_name=None, request_date=None, status=None, 
               task_type=None, delivered_date=None, subtasks=None, description=None):
        """Update a task with status history tracking"""
        connection = get_db_connection()
        try:
            # Get current task to check status change
            current_task = Task.get_by_id(task_id, user_id)
            if not current_task:
                return False
            
            old_status = current_task.get('status')
            updates = []
            values = []
            
            # Track status changes
            if status is not None and status != old_status:
                # Log status change to history
                Task.log_status_change(task_id, old_status, status, user_id)
                
                # Track completions
                if status == 'Completed' and old_status != 'Completed':
                    updates.append("last_completed_date = NOW()")
                    if not current_task.get('first_completed_date'):
                        updates.append("first_completed_date = NOW()")
                    updates.append("completion_count = completion_count + 1")
                
                # Track reopen (from Completed to In Progress or Pending)
                if old_status == 'Completed' and status in ['In Progress', 'Pending']:
                    updates.append("reopened_count = reopened_count + 1")
            
            if project_name is not None:
                updates.append("project_name = %s")
                values.append(project_name)
            if description is not None:
                updates.append("description = %s")
                values.append(description)
            if request_date is not None:
                updates.append("request_date = %s")
                values.append(request_date)
            if status is not None:
                updates.append("status = %s")
                values.append(status)
            if task_type is not None:
                updates.append("task_type = %s")
                values.append(task_type)
            if delivered_date is not None:
                updates.append("delivered_date = %s")
                values.append(delivered_date)
            if subtasks is not None:
                updates.append("subtasks = %s")
                values.append(Json(subtasks))
            
            if not updates:
                return False
            
            values.extend([task_id, user_id])
            
            with connection.cursor() as cursor:
                cursor.execute(f"""
                    UPDATE tasks
                    SET {', '.join(updates)}
                    WHERE id = %s AND user_id = %s
                """, values)
                connection.commit()
                return cursor.rowcount > 0
        except Exception as e:
            connection.rollback()
            raise e
        finally:
            connection.close()
    
    @staticmethod
    def delete(task_id, user_id):
        """Delete a task"""
        connection = get_db_connection()
        try:
            with connection.cursor() as cursor:
                cursor.execute("DELETE FROM tasks WHERE id = %s AND user_id = %s", (task_id, user_id))
                connection.commit()
                return cursor.rowcount > 0
        except Exception as e:
            connection.rollback()
            raise e
        finally:
            connection.close()

