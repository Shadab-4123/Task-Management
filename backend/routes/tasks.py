from flask import Blueprint, request, jsonify, session
from models import Task
from datetime import datetime

tasks_bp = Blueprint('tasks', __name__)

def require_auth():
    """Helper function to check if user is authenticated"""
    if 'user_id' not in session:
        return None
    return session['user_id']

@tasks_bp.route('/api/tasks', methods=['GET'])
def get_tasks():
    """Get all tasks for the authenticated user"""
    user_id = require_auth()
    if not user_id:
        return jsonify({'error': 'Authentication required'}), 401
    
    try:
        tasks = Task.get_all_by_user(user_id)
        return jsonify({'tasks': tasks}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@tasks_bp.route('/api/tasks', methods=['POST'])
def create_task():
    """Create a new task"""
    user_id = require_auth()
    if not user_id:
        return jsonify({'error': 'Authentication required'}), 401
    
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data.get('project_name'):
            return jsonify({'error': 'Project name is required'}), 400
        if not data.get('task_type'):
            return jsonify({'error': 'Task type is required'}), 400
        
        # Validate task_type
        valid_types = ['CR', 'Data request', 'config']
        if data.get('task_type') not in valid_types:
            return jsonify({'error': f'Task type must be one of: {", ".join(valid_types)}'}), 400
        
        task_id = Task.create(
            user_id=user_id,
            project_name=data.get('project_name'),
            description=data.get('description'),
            request_date=data.get('request_date'),
            status=data.get('status', 'Pending'),
            task_type=data.get('task_type'),
            delivered_date=data.get('delivered_date'),
            subtasks=data.get('subtasks', [])
        )
        
        task = Task.get_by_id(task_id, user_id)
        return jsonify({'success': True, 'task': task}), 201
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@tasks_bp.route('/api/tasks/<int:task_id>', methods=['GET'])
def get_task(task_id):
    """Get a specific task"""
    user_id = require_auth()
    if not user_id:
        return jsonify({'error': 'Authentication required'}), 401
    
    try:
        task = Task.get_by_id(task_id, user_id)
        if not task:
            return jsonify({'error': 'Task not found'}), 404
        return jsonify({'task': task}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@tasks_bp.route('/api/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    """Update a task"""
    user_id = require_auth()
    if not user_id:
        return jsonify({'error': 'Authentication required'}), 401
    
    try:
        data = request.get_json()
        
        # Validate task_type if provided
        if 'task_type' in data:
            valid_types = ['CR', 'Data request', 'config']
            if data['task_type'] not in valid_types:
                return jsonify({'error': f'Task type must be one of: {", ".join(valid_types)}'}), 400
        
        success = Task.update(
            task_id=task_id,
            user_id=user_id,
            project_name=data.get('project_name'),
            description=data.get('description'),
            request_date=data.get('request_date'),
            status=data.get('status'),
            task_type=data.get('task_type'),
            delivered_date=data.get('delivered_date'),
            subtasks=data.get('subtasks')
        )
        
        if not success:
            return jsonify({'error': 'Task not found'}), 404
        
        task = Task.get_by_id(task_id, user_id)
        return jsonify({'success': True, 'task': task}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@tasks_bp.route('/api/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    """Delete a task"""
    user_id = require_auth()
    if not user_id:
        return jsonify({'error': 'Authentication required'}), 401
    
    try:
        success = Task.delete(task_id, user_id)
        if not success:
            return jsonify({'error': 'Task not found'}), 404
        return jsonify({'success': True, 'message': 'Task deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@tasks_bp.route('/api/tasks/<int:task_id>/history', methods=['GET'])
def get_task_history(task_id):
    """Get status history for a task"""
    user_id = require_auth()
    if not user_id:
        return jsonify({'error': 'Authentication required'}), 401
    
    try:
        history = Task.get_status_history(task_id, user_id)
        return jsonify({'history': history}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

