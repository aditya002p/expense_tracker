from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql://myuser:A9670761970p%@localhost/expense_tracker"
    
    # API
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Splitwise Clone"
    VERSION: str = "1.0.0"
    
    # OpenAI
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_MODEL: str = "gpt-4"
    
    # CORS
    BACKEND_CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost:8080"]
    
    class Config:
        env_file = ".env"

settings = Settings()