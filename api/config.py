from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    database_url: str = "postgresql://postgres:postgres@localhost/personal_site"
    e2b_api_key: str = "e2b_api_key"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
