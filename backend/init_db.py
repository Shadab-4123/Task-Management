"""
Script to initialize the database and create tables.
Run this script before creating users or starting the application.

Usage:
    python init_db.py
"""

from database import init_database

def main():
    print("=" * 50)
    print("Initializing Database")
    print("=" * 50)
    
    try:
        init_database()
        print("\n[SUCCESS] Database initialized successfully!")
        print("  Tables created: users, tasks")
        print("\nYou can now create users using create_user.py")
    except Exception as e:
        print(f"\n[ERROR] Error initializing database: {e}")
        print("\nPlease check:")
        print("  1. Supabase project is created and reachable")
        print("  2. DATABASE_URL (or SUPABASE_DB_* vars) is correct")
        print("  3. Database password and network access are valid")

if __name__ == "__main__":
    main()

