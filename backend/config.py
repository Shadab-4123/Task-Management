import os
from urllib.parse import quote_plus
from dotenv import load_dotenv

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ENV_PATH = os.path.join(BASE_DIR, ".env")
load_dotenv(ENV_PATH)

class Config:
    # Supabase / PostgreSQL configuration
    # Preferred: set DATABASE_URL directly from Supabase connection string.
    DATABASE_URL = os.getenv('DATABASE_URL')

    # Optional fallback parts if DATABASE_URL is not provided.
    SUPABASE_DB_HOST = os.getenv('SUPABASE_DB_HOST', '')
    SUPABASE_DB_PORT = int(os.getenv('SUPABASE_DB_PORT', 5432))
    SUPABASE_DB_NAME = os.getenv('SUPABASE_DB_NAME', 'postgres')
    SUPABASE_DB_USER = os.getenv('SUPABASE_DB_USER', 'postgres')
    SUPABASE_DB_PASSWORD = os.getenv('SUPABASE_DB_PASSWORD', '')
    DB_SSLMODE = os.getenv('DB_SSLMODE', 'require')

    if not DATABASE_URL and SUPABASE_DB_HOST and SUPABASE_DB_PASSWORD:
        encoded_password = quote_plus(SUPABASE_DB_PASSWORD)
        DATABASE_URL = (
            f"postgresql://{SUPABASE_DB_USER}:{encoded_password}"
            f"@{SUPABASE_DB_HOST}:{SUPABASE_DB_PORT}/{SUPABASE_DB_NAME}"
            f"?sslmode={DB_SSLMODE}"
        )
    
    # Flask Configuration
    SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key-change-in-production')
    DEBUG = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
    
    # CORS Configuration
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:3000,http://localhost:5173').split(',')


