import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI PowerPoint Editor"
    API_V1_STR: str = "/api/v1"
    UPLOAD_DIR: str = "tmp_uploads"
    GEMINI_API_KEY: str | None = os.getenv("GEMINI_API_KEY")

    class Config:
        case_sensitive = True

settings = Settings()
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
