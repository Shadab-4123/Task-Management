from flask import Blueprint, request, jsonify, session
from models import User

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/api/login', methods=['POST'])
def login():
    """Handle user login"""
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return jsonify({'error': 'Username and password are required'}), 400
        
        user = User.authenticate(username, password)
        
        if user:
            # Store user ID in session
            session['user_id'] = user['id']
            session['username'] = user['username']
            return jsonify({
                'success': True,
                'user': {
                    'id': user['id'],
                    'username': user['username']
                }
            }), 200
        else:
            return jsonify({'error': 'Invalid username or password'}), 401
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/api/register', methods=['POST'])
def register():
    """Handle new user registration"""
    try:
        data = request.get_json()
        username = (data.get('username') or '').strip()
        password = data.get('password')
        confirm_password = data.get('confirm_password')

        if not username or not password or not confirm_password:
            return jsonify({'error': 'Username, password and confirm password are required'}), 400

        if password != confirm_password:
            return jsonify({'error': 'Passwords do not match'}), 400

        user_id = User.create(username, password)
        return jsonify({
            'success': True,
            'message': 'User registered successfully',
            'user': {
                'id': user_id,
                'username': username
            }
        }), 201

    except Exception as e:
        message = str(e).lower()
        if 'duplicate' in message or 'unique' in message:
            return jsonify({'error': 'Username already exists. Please choose a different username.'}), 409
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/api/logout', methods=['POST'])
def logout():
    """Handle user logout"""
    session.clear()
    return jsonify({'success': True, 'message': 'Logged out successfully'}), 200

@auth_bp.route('/api/check-auth', methods=['GET'])
def check_auth():
    """Check if user is authenticated"""
    if 'user_id' in session:
        return jsonify({
            'authenticated': True,
            'user': {
                'id': session['user_id'],
                'username': session['username']
            }
        }), 200
    return jsonify({'authenticated': False}), 401


