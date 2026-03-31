# Task Management System

A full-stack task management application built with React.js frontend, Python Flask backend, and Supabase PostgreSQL.

## Features

- **User Authentication**: Secure login system with session management
- **Task Management**: Create, read, update, and delete tasks
- **Project Organization**: Tasks organized by project name
- **Task Types**: Support for CR, Data request, and config task types
- **Status Tracking**: Track task status (Pending, In Progress, Completed)
- **Date Management**: Request date, created date (auto-generated), and delivered date
- **Subtasks**: Support for multiple subtasks within each task
- **Filtering**: Filter tasks by status and type

## Project Structure

```
task-management/
├── backend/              # Flask backend application
│   ├── app.py           # Main Flask application
│   ├── config.py        # Configuration settings
│   ├── database.py      # Database connection and initialization
│   ├── models.py        # Data models (User, Task)
│   ├── routes/          # API routes
│   │   ├── auth.py      # Authentication endpoints
│   │   └── tasks.py     # Task CRUD endpoints
│   └── requirements.txt # Python dependencies
├── frontend/            # React.js frontend application
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── services/    # API service layer
│   │   └── App.jsx      # Main application component
│   └── package.json     # Node.js dependencies
├── database/            # Database scripts
│   └── schema.sql       # Supabase/PostgreSQL schema
└── README.md           # This file
```

## Prerequisites

- **Python 3.8+** installed
- **Node.js 16+** and npm installed
- **Supabase account** ([create one here](https://supabase.com/))

## Installation & Setup

### 1. Supabase Project + Database Setup

1. Create a new project in Supabase dashboard.
2. In Supabase, go to **SQL Editor**.
3. Open `database/schema.sql`, copy it, and run it in SQL Editor.
4. Go to **Project Settings -> Database** and copy your connection string.
   - Use the pooled/direct PostgreSQL string and keep `sslmode=require`.

### 2. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment (recommended):
   ```bash
   python -m venv venv
   ```

3. Activate the virtual environment:
   - Windows:
     ```bash
     venv\Scripts\activate
     ```
   - Linux/Mac:
     ```bash
     source venv/bin/activate
     ```

4. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

5. Create a `.env` file in the backend directory:
   ```env
   # Recommended (single variable)
   DATABASE_URL=postgresql://postgres.<project-ref>:<password>@<host>:5432/postgres?sslmode=require

   # Optional alternate format (if not using DATABASE_URL)
   # SUPABASE_DB_HOST=<host>
   # SUPABASE_DB_PORT=5432
   # SUPABASE_DB_NAME=postgres
   # SUPABASE_DB_USER=postgres
   # SUPABASE_DB_PASSWORD=<password>
   # DB_SSLMODE=require

   SECRET_KEY=your-secret-key-here
   FLASK_DEBUG=True
   CORS_ORIGINS=http://localhost:3000,http://localhost:5173
   ```

6. Run the Flask server:
   ```bash
   python app.py
   ```

   The backend will be running at `http://localhost:5000`

### 3. Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

   The frontend will be running at `http://localhost:3000` (or the port shown in terminal)

## Creating Your First User

After setting up the database, you need to create a user account. You have two options:

### Option 1: Using the create_user.py script (Recommended)
1. Navigate to the backend directory
2. Activate your virtual environment (if using one)
3. Run the script:
   ```bash
   python create_user.py
   ```
4. Follow the prompts to enter username and password

### Option 2: Using Python directly
```python
from models import User
User.create('admin', 'admin123')
```

### Option 3: Through the application
Once you have at least one user, you can create additional users through the application interface (if you implement a registration feature).

## API Endpoints

### Authentication
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `GET /api/check-auth` - Check authentication status

### Tasks
- `GET /api/tasks` - Get all tasks for authenticated user
- `POST /api/tasks` - Create a new task
- `GET /api/tasks/<id>` - Get a specific task
- `PUT /api/tasks/<id>` - Update a task
- `DELETE /api/tasks/<id>` - Delete a task

## Database Schema (Supabase PostgreSQL)

### Users Table
- `id` (BIGSERIAL, PRIMARY KEY)
- `username` (VARCHAR(50), UNIQUE)
- `password` (VARCHAR(255)) - bcrypt hashed
- `created_at` (TIMESTAMP)

### Tasks Table
- `id` (BIGSERIAL, PRIMARY KEY)
- `user_id` (BIGINT, FOREIGN KEY)
- `project_name` (VARCHAR(255))
- `request_date` (DATE)
- `created_date` (TIMESTAMPTZ, DEFAULT CURRENT_TIMESTAMP)
- `status` (VARCHAR(50)) - Pending, In Progress, Completed
- `task_type` (VARCHAR + CHECK) - CR, Data request, config
- `delivered_date` (DATE, NULLABLE)
- `subtasks` (JSONB) - Array of subtask objects

## Task Fields

Each task contains:
- **Project Name**: Name of the project (required)
- **Request Date**: Date when the task was requested
- **Created Date**: Automatically set when task is created
- **Status**: Pending, In Progress, or Completed
- **Task Type**: CR, Data request, or config (required)
- **Delivered Date**: Date when task was delivered
- **Subtasks**: Array of subtasks (each with name and optional completion status)

## Usage

1. **Login**: Access the application and log in with your credentials
2. **Create Task**: Click "Create New Task" to add a new task
3. **Edit Task**: Click "Edit" on any task to modify it
4. **Delete Task**: Click "Delete" to remove a task (with confirmation)
5. **Filter Tasks**: Use the filter dropdowns to filter by status or type
6. **Manage Subtasks**: Add, remove, or mark subtasks as completed

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Ensure Supabase DB password is correct
- Confirm `sslmode=require` is present in connection string

### CORS Errors
- Ensure backend CORS configuration includes your frontend URL
- Check `backend/config.py` for `CORS_ORIGINS` setting

### Port Conflicts
- Backend default port: 5000
- Frontend default port: 3000
- Change ports in `backend/app.py` and `frontend/vite.config.js` if needed

### Module Not Found Errors
- Ensure all dependencies are installed (`pip install -r requirements.txt` and `npm install`)
- Check virtual environment is activated for Python

## Security Notes

- Passwords are hashed using bcrypt
- SQL injection prevention via parameterized queries
- Session-based authentication
- CORS configured for specific origins
- **Important**: Change the `SECRET_KEY` in production
- **Important**: Use a strong Supabase DB password

## Development

### Backend Development
- Flask runs in debug mode by default (set `FLASK_DEBUG=False` in production)
- API endpoints return JSON responses
- Error handling included for common scenarios

### Frontend Development
- React 18 with Vite for fast development
- Axios for HTTP requests
- React Router for navigation
- Date picker component for date selection

## Production Deployment

1. Set `FLASK_DEBUG=False` in environment variables
2. Use a production WSGI server (e.g., Gunicorn) for Flask
3. Configure proper CORS origins for your domain
4. Use environment variables for sensitive data
5. Use Supabase network/database security best practices
6. Enable HTTPS
7. Build React app: `npm run build` and serve static files

## License

This project is provided as-is for development and learning purposes.

## Support

For issues or questions, please check:
- Database connection settings
- Supabase project status
- Python and Node.js versions
- All dependencies are installed correctly

