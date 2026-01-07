import uuid
from datetime import datetime, timedelta
from typing import Dict, Optional
from e2b_code_interpreter import Sandbox
from database import SessionLocal
from models import TerminalSession
from e2b_setup import populate_example_files
from dotenv import load_dotenv
load_dotenv()

class SessionManager:
    """Manages E2B terminal sessions with in-memory client storage and PostgreSQL persistence."""
    
    def __init__(self):
        self.sessions: Dict[str, Sandbox] = {}  # token -> E2B Sandbox instance
        
    async def start_session(self) -> dict:
        """Create a new E2B terminal session."""
        session_id = str(uuid.uuid4())
        token = str(uuid.uuid4())
        expires_at = datetime.utcnow() + timedelta(minutes=10)
        
        try:
            sandbox = Sandbox.create()
            populate_example_files(sandbox)
            self.sessions[token] = sandbox
            
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
            finally:
                db.close()
            
            return {
                "session_token": token,
                "expires_at": expires_at.isoformat(),
                "expires_in": 600
            }
        except Exception as e:
            raise Exception(f"Failed to create session: {str(e)}")
    
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
