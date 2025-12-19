import asyncio
import uuid
from datetime import datetime, timedelta
from typing import Dict, Optional
from e2b_code_interpreter import Sandbox
from sqlalchemy.orm import Session
from .database import SessionLocal
from .models import TerminalSession
from .config import settings
import os
from dotenv import load_dotenv
load_dotenv()

class SessionManager:
    """Manages E2B terminal sessions with in-memory client storage and PostgreSQL persistence."""
    
    def __init__(self):
        self.sessions: Dict[str, Sandbox] = {}  # token -> E2B Sandbox instance
        
    async def start_session(self) -> dict:
        """Create a new E2B terminal session."""
        import logging
        logger = logging.getLogger(__name__)
        
        # Generate unique identifiers
        session_id = str(uuid.uuid4())
        token = str(uuid.uuid4())
        expires_at = datetime.utcnow() + timedelta(minutes=10)
        
        logger.info(f"Creating E2B sandbox for session {session_id}...")
        
        # Create E2B sandbox
        try:
            sandbox = Sandbox.create()
            logger.info("E2B sandbox created successfully")
            
            # Populate with example files
            logger.info("Populating example files...")
            await self._populate_example_files(sandbox)
            logger.info("Example files populated")
            
            # Store in memory
            self.sessions[token] = sandbox
            logger.info(f"Session stored in memory, total sessions: {len(self.sessions)}")
            
            # Store in database
            logger.info("Saving to database...")
            db = SessionLocal()
            try:
                db_session = TerminalSession(
                    session_id=session_id,
                    token=token,
                    expires_at=expires_at,
                    is_active=True
                )
                db.add(db_session)
                db.commit()
                logger.info("Session saved to database")
            except Exception as db_error:
                logger.error(f"Database error: {db_error}", exc_info=True)
                raise
            finally:
                db.close()
            
            return {
                "session_token": token,
                "expires_at": expires_at.isoformat(),
                "expires_in": 600
            }
        except Exception as e:
            logger.error(f"Failed to create session: {type(e).__name__}: {str(e)}", exc_info=True)
            raise Exception(f"Failed to create session: {str(e)}")
    
    async def _populate_example_files(self, sandbox: Sandbox):
        """Populate E2B sandbox with example files."""
        # README.md
        sandbox.files.write(
            "/home/user/README.md",
            """# Welcome to Terminal

This is a live sandbox environment powered by E2B.

## Available Files
- `hello.py` - Simple Python script
- `data.json` - Sample JSON data
- `notes.txt` - Text notes

## Try These Commands
- `ls` - List files
- `cat README.md` - Display this file
- `python hello.py` - Run the Python script
- `cat data.json` - View JSON data

You have full access to a Linux environment with Python, Node.js, and common tools.
"""
        )
        
        # hello.py
        sandbox.files.write(
            "/home/user/hello.py",
            """#!/usr/bin/env python3
import sys

def main():
    print("Hello from the Terminal!")
    print(f"Python version: {sys.version}")
    print("This script is running in an E2B sandbox.")
    
    # Simple calculation
    result = sum(range(1, 11))
    print(f"\\nSum of 1-10: {result}")

if __name__ == "__main__":
    main()
"""
        )
        
        # data.json
        sandbox.files.write(
            "/home/user/data.json",
            """{
  "project": "Terminal",
  "version": "1.0.0",
  "features": [
    "E2B Terminal Integration",
    "Real-time Command Execution",
    "Session Management"
  ],
  "stats": {
    "files": 4,
    "languages": ["Python", "JSON", "Markdown"]
  }
}
"""
        )
        
        # notes.txt
        sandbox.files.write(
            "/home/user/notes.txt",
            """Personal Notes
==============

This is a sample text file in your terminal session.
Feel free to create, edit, and delete files as needed.

Session expires in 10 minutes.
"""
        )
    
    def get_session(self, token: str) -> Optional[Sandbox]:
        """Retrieve an active session by token."""
        if token not in self.sessions:
            return None
        
        # Verify session is still valid in database
        db = SessionLocal()
        try:
            db_session = db.query(TerminalSession).filter(
                TerminalSession.token == token,
                TerminalSession.is_active == True,
                TerminalSession.expires_at > datetime.utcnow()
            ).first()
            
            if not db_session:
                # Session expired or doesn't exist
                self._close_session_internal(token)
                return None
            
            return self.sessions[token]
        finally:
            db.close()
    
    async def execute_command(self, token: str, command: str) -> dict:
        """Execute a command in the session's E2B sandbox."""
        sandbox = self.get_session(token)
        if not sandbox:
            return {"error": "Session not found or expired"}
        
        try:
            # Execute command in sandbox
            result = sandbox.commands.run(command)
            
            return {
                "output": result.stdout + result.stderr,
                "exit_code": result.exit_code
            }
        except Exception as e:
            return {"error": f"Command execution failed: {str(e)}"}
    
    def close_session(self, token: str):
        """Manually close a session."""
        self._close_session_internal(token)
        
        # Mark as inactive in database
        db = SessionLocal()
        try:
            db_session = db.query(TerminalSession).filter(
                TerminalSession.token == token
            ).first()
            
            if db_session:
                db_session.is_active = False
                db.commit()
        finally:
            db.close()
    
    def _close_session_internal(self, token: str):
        """Internal method to close E2B sandbox and remove from memory."""
        if token in self.sessions:
            try:
                self.sessions[token].kill()
            except:
                pass  # Ignore errors during cleanup
            del self.sessions[token]
    
    async def cleanup_expired(self):
        """Clean up expired sessions (to be called periodically)."""
        db = SessionLocal()
        try:
            # Find expired sessions
            expired = db.query(TerminalSession).filter(
                TerminalSession.is_active == True,
                TerminalSession.expires_at <= datetime.utcnow()
            ).all()
            
            for session in expired:
                self._close_session_internal(session.token)
                session.is_active = False
            
            db.commit()
        finally:
            db.close()


# Global session manager instance
session_manager = SessionManager()
