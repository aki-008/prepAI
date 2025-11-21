import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql+asyncpg://postgres:mysecretpassword@localhost:5432/studentdb"
    )
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Application
    APP_NAME: str = "Student Management API"
    APP_VERSION: str = "1.0.0"
    APP_DESCRIPTION: str = "FastAPI + PostgreSQL with SQLAlchemy async"
    
    # CORS
    CORS_ORIGINS: list = ["*"]
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()