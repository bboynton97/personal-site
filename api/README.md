# Personal Site API

A simple FastAPI service for the personal site.

## Setup

1. Install dependencies with uv:
   ```bash
   uv sync
   ```

2. Run the server:
   ```bash
   uv run python main.py
   ```

   Or with uvicorn directly:
   ```bash
   uv run uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

## Development

For development with additional dev dependencies:
```bash
uv sync --dev
```

## Endpoints

- `GET /` - Root endpoint
- `GET /health` - Health check
- `GET /api/hello` - Simple hello endpoint

## Development

The API runs on `http://localhost:8000` by default.

Interactive API documentation is available at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
