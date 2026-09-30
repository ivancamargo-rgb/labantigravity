import os
from dataclasses import dataclass
from dotenv import load_dotenv

load_dotenv()


@dataclass(frozen=True)
class Settings:
    gemini_api_key: str = os.getenv("GEMINI_API_KEY", "")
    gemini_model: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    vector_db_path: str = os.getenv("VECTOR_DB_PATH", "./chroma_db")
    log_level: str = os.getenv("LOG_LEVEL", "INFO")


settings = Settings()
