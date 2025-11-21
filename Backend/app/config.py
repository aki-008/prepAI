from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    APP_NAME: str = "Student Management API"
    APP_VERSION: str = "1.0.0"
    APP_DESCRIPTION: str = "FastAPI + PostgreSQL with SQLAlchemy async"

    CORS_ORIGINS: list = ["*"]

    class Config:
        env_file = ".env"
        extra = "ignore"  # optional

settings = Settings()
