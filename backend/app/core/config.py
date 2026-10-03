import os
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "JalDristi Backend"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    DEBUG: bool = True
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "*"
    ]
    DATA_DIR: str = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")

settings = Settings()
