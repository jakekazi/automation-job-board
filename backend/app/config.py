from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Database
    database_url: str = "postgresql://aitb:aitb_dev_password@localhost:5432/aitb_jobboard"

    # Auth
    jwt_secret_key: str = "hackathon-secret-key-change-later"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24  # 24 hours for hackathon convenience

    # OpenRouter
    openrouter_api_key: str = ""

    # App
    debug: bool = True

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
