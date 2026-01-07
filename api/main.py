import asyncio
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
from session_manager import session_manager


class ExecuteCommandRequest(BaseModel):
    session_token: str
    command: str


class EndSessionRequest(BaseModel):
    session_token: str


async def cleanup_task():
    """Background task to clean up expired sessions every minute."""
    while True:
        await asyncio.sleep(60)  # Run every minute
        await session_manager.cleanup_expired()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifespan events."""
    # Startup: Start background cleanup task
    cleanup_job = asyncio.create_task(cleanup_task())
    yield
    # Shutdown: Cancel cleanup task
    cleanup_job.cancel()


app = FastAPI(title="Personal Site API", version="1.0.0", lifespan=lifespan)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://braelyn.ai",
        "https://www.braelyn.ai",
        "http://localhost:4200",  # Angular dev server
        "http://localhost:5173",  # Vite dev server
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "Welcome to Personal Site API"}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}

@app.get("/api/hello")
async def hello():
    """Simple hello endpoint"""
    return {"message": "Hello from the API!"}


@app.get("/api/lastfm/now-playing")
async def get_lastfm_now_playing():
    """Get the last scrobbled track from Last.fm."""
    import logging
    logger = logging.getLogger(__name__)
    
    api_key = os.getenv("LAST_FM_API_KEY")
    username = os.getenv("LAST_FM_USERNAME", "braelinux")
    
    if not api_key:
        logger.error("LAST_FM_API_KEY not configured")
        raise HTTPException(status_code=500, detail="LAST_FM_API_KEY not configured")
    
    url = "https://ws.audioscrobbler.com/2.0/"
    params = {
        "method": "user.getrecenttracks",
        "user": username,
        "api_key": api_key,
        "format": "json",
        "limit": 1,
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params)
            
            if response.status_code != 200:
                logger.error(f"Last.fm API returned {response.status_code}: {response.text}")
                raise HTTPException(status_code=502, detail="Failed to fetch from Last.fm")
            
            data = response.json()
            
            track = data["recenttracks"]["track"][0]
            now_playing = track.get("@attr", {}).get("nowplaying", "false") == "true"
            
            return {
                "artist": track["artist"]["#text"],
                "track": track["name"],
                "album": track["album"]["#text"],
                "now_playing": now_playing,
                "url": track["url"],
                "image": track["image"][-1]["#text"] if track["image"] else None,
            }
    except HTTPException:
        raise
    except (KeyError, IndexError) as e:
        logger.error(f"Failed to parse Last.fm response: {e}")
        raise HTTPException(status_code=404, detail="No recent tracks found")
    except Exception as e:
        logger.error(f"Unexpected error in lastfm endpoint: {type(e).__name__}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/terminal/session/start")
async def start_terminal_session():
    """Start a new E2B terminal session."""
    import logging
    logger = logging.getLogger(__name__)
    
    try:
        logger.info("Starting new terminal session...")
        result = await session_manager.start_session()
        logger.info(f"Session started successfully: {result['session_token']}")
        return result
    except Exception as e:
        logger.error(f"Failed to start session: {type(e).__name__}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"{type(e).__name__}: {str(e)}")

@app.post("/api/terminal/session/execute")
async def execute_terminal_command(request: ExecuteCommandRequest):
    """Execute a command in an active terminal session."""
    result = await session_manager.execute_command(request.session_token, request.command)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result

@app.delete("/api/terminal/session/end")
async def end_terminal_session(request: EndSessionRequest):
    """End a terminal session."""
    session_manager.close_session(request.session_token)
    return {"status": "session closed"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
