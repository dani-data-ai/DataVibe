from pydantic_settings import BaseSettings
from typing import List, Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "DataVibe"
    VERSION: str = "1.0.0"
    
    # CORS - Allow all origins for cloud deployment
    ALLOWED_HOSTS: List[str] = ["*"]
    
    # LLM APIs - Must be provided at runtime
    OPENAI_API_KEY: Optional[str] = None
    ANTHROPIC_API_KEY: Optional[str] = None
    
    # Environment
    ENVIRONMENT: str = "production"
    
    class Config:
        env_file = ".env"

settings = Settings()