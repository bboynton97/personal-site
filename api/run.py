#!/usr/bin/env python3
"""
Run the FastAPI application with uvicorn.
"""
import sys
import os
import uvicorn

# Add parent directory to path so 'api' package can be imported
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

if __name__ == "__main__":
    uvicorn.run(
        "api.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
