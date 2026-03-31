import psycopg2
from psycopg2.extras import RealDictCursor
from config import Config

def get_db_connection():
    """Create and return a PostgreSQL connection."""
    if not Config.DATABASE_URL:
        raise RuntimeError(
            "DATABASE_URL is not configured. Set it to your Supabase Postgres connection string."
        )

    try:
        connection = psycopg2.connect(
            Config.DATABASE_URL,
            cursor_factory=RealDictCursor
        )
        connection.autocommit = False
        return connection
    except psycopg2.Error as e:
        print(f"Error connecting to PostgreSQL: {e}")
        raise

def init_database():
    """Initialize tables and indexes in Supabase PostgreSQL."""
    try:
        connection = get_db_connection()

        with connection.cursor() as cursor:
            # Create users table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id BIGSERIAL PRIMARY KEY,
                    username VARCHAR(50) UNIQUE NOT NULL,
                    password VARCHAR(255) NOT NULL,
                    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
                )
            """)

            # Create tasks table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS tasks (
                    id BIGSERIAL PRIMARY KEY,
                    user_id BIGINT NOT NULL,
                    project_name VARCHAR(255) NOT NULL,
                    description TEXT,
                    request_date DATE,
                    created_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                    status VARCHAR(50) DEFAULT 'Pending',
                    task_type VARCHAR(50) NOT NULL,
                    delivered_date DATE NULL,
                    subtasks JSONB DEFAULT '[]'::jsonb,
                    first_completed_date TIMESTAMPTZ NULL,
                    last_completed_date TIMESTAMPTZ NULL,
                    completion_count INT DEFAULT 0,
                    reopened_count INT DEFAULT 0,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    CONSTRAINT tasks_task_type_check
                        CHECK (task_type IN ('CR', 'Data request', 'config'))
                )
            """)

            cursor.execute("CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks (user_id)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks (status)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_tasks_task_type ON tasks (task_type)")

            # Create status history table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS task_status_history (
                    id BIGSERIAL PRIMARY KEY,
                    task_id BIGINT NOT NULL,
                    old_status VARCHAR(50),
                    new_status VARCHAR(50) NOT NULL,
                    changed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                    changed_by BIGINT,
                    notes TEXT,
                    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
                    FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL
                )
            """)

            cursor.execute(
                "CREATE INDEX IF NOT EXISTS idx_task_status_history_task_id ON task_status_history (task_id)"
            )
            cursor.execute(
                "CREATE INDEX IF NOT EXISTS idx_task_status_history_changed_at ON task_status_history (changed_at)"
            )
            cursor.execute(
                "CREATE INDEX IF NOT EXISTS idx_task_status_history_new_status ON task_status_history (new_status)"
            )

            # Keep compatibility with older schemas by adding columns when missing.
            cursor.execute("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS description TEXT")
            cursor.execute("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS subtasks JSONB DEFAULT '[]'::jsonb")
            cursor.execute("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS first_completed_date TIMESTAMPTZ NULL")
            cursor.execute("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS last_completed_date TIMESTAMPTZ NULL")
            cursor.execute("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS completion_count INT DEFAULT 0")
            cursor.execute("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS reopened_count INT DEFAULT 0")

            connection.commit()
            print("Database initialized successfully")

        connection.close()

    except psycopg2.Error as e:
        print(f"Error initializing database: {e}")
        raise

