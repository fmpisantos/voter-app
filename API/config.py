import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'
    HOST = os.getenv('HOST', '0.0.0.0')
    PORT = int(os.getenv('PORT', 8080))
    ENV = os.getenv('ENV', 'development')

    MAX_SCORE_2_PERCENTAGE = 0.4
    MAX_SCORE_1_PERCENTAGE = 0.3

    CORS_ORIGINS = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ]

    if ENV == 'production':
        CORS_ORIGINS.extend([
            "https://yourdomain.com",
            "https://www.yourdomain.com",
        ])