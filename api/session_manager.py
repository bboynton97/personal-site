import uuid
import asyncio
import threading
from datetime import datetime, timedelta
from typing import Dict, Optional, Callable
from dataclasses import dataclass, field
from e2b_code_interpreter import Sandbox
from e2b.sandbox.commands.command_handle import PtySize
from database import SessionLocal
from models import TerminalSession
from e2b_setup import populate_example_files
from dotenv import load_dotenv
load_dotenv()


@dataclass
class PtySession:
    """Holds PTY session state."""
    sandbox: Sandbox
    pty_pid: int
    output_callback: Optional[Callable[[str], None]] = None
    _event_thread: Optional[threading.Thread] = field(default=None, repr=False)
    _stop_event: threading.Event = field(default_factory=threading.Event, repr=False)


class SessionManager:
    """Manages E2B terminal sessions with PTY support for true interactivity."""
    
    def __init__(self):
        self.sessions: Dict[str, PtySession] = {}  # token -> PtySession
        
    async def start_session(self, on_output: Optional[Callable[[str], None]] = None) -> dict:
        """Create a new E2B terminal session with PTY."""
        session_id = str(uuid.uuid4())
        token = str(uuid.uuid4())
        expires_at = datetime.utcnow() + timedelta(minutes=10)
        
        try:
            # Create sandbox
            sandbox = Sandbox.create()
            populate_example_files(sandbox)
            
            # Create PTY session for interactive terminal
            # timeout=0 disables the timeout for long-running sessions
            size = PtySize(rows=24, cols=80)
            pty_handle = sandbox.pty.create(
                size=size,
                cwd="/home/user",
                timeout=0,  # Disable timeout for interactive PTY
            )
            
            pty_session = PtySession(
                sandbox=sandbox,
                pty_pid=pty_handle.pid,
                output_callback=on_output,
            )
            self.sessions[token] = pty_session
            
            # Start background thread to read PTY output
            self._start_output_reader(token, pty_handle)
            
            # Store in database
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
    
    def _start_output_reader(self, token: str, pty_handle) -> None:
        """Start a background thread to read PTY output events."""
        session = self.sessions.get(token)
        if not session:
            return
        
        def read_events():
            try:
                # Iterator yields tuples: (stdout, stderr, pty)
                for stdout, stderr, pty in pty_handle:
                    if session._stop_event.is_set():
                        break
                    # Handle stdout output
                    if stdout is not None:
                        self._handle_pty_output(token, stdout)
                    # Handle stderr output
                    if stderr is not None:
                        self._handle_pty_output(token, stderr)
                    # Handle PTY output (raw bytes)
                    if pty is not None:
                        # PTY output is bytes, decode to string
                        if isinstance(pty, bytes):
                            self._handle_pty_output(token, pty.decode('utf-8', 'replace'))
                        else:
                            self._handle_pty_output(token, str(pty))
            except Exception as e:
                print(f"PTY output reader error: {e}")
        
        thread = threading.Thread(target=read_events, daemon=True)
        session._event_thread = thread
        thread.start()
    
    def _handle_pty_output(self, token: str, data: str) -> None:
        """Handle output from PTY and forward to callback."""
        if token in self.sessions:
            session = self.sessions[token]
            if session.output_callback:
                try:
                    session.output_callback(data)
                except Exception as e:
                    print(f"Output callback error: {e}")
    
    def set_output_callback(self, token: str, callback: Callable[[str], None]) -> bool:
        """Set the output callback for a session (used when WebSocket connects)."""
        if token in self.sessions:
            self.sessions[token].output_callback = callback
            return True
        return False
    
    def get_session(self, token: str) -> Optional[PtySession]:
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
    
    def send_input(self, token: str, data: str) -> bool:
        """Send input to the PTY session."""
        session = self.get_session(token)
        if not session:
            return False
        
        try:
            session.sandbox.pty.send_stdin(session.pty_pid, data.encode())
            return True
        except Exception as e:
            print(f"Failed to send input: {e}")
            return False
    
    def resize_pty(self, token: str, rows: int, cols: int) -> bool:
        """Resize the PTY terminal."""
        session = self.get_session(token)
        if not session:
            return False
        
        try:
            size = PtySize(rows=rows, cols=cols)
            session.sandbox.pty.resize(session.pty_pid, size=size)
            return True
        except Exception as e:
            print(f"Failed to resize PTY: {e}")
            return False
    
    async def execute_command(self, token: str, command: str) -> dict:
        """Execute a command in the session's E2B sandbox (legacy HTTP mode)."""
        session = self.get_session(token)
        if not session:
            return {"error": "Session not found or expired"}
        
        try:
            # For legacy support, use commands.run
            result = session.sandbox.commands.run(command)
            
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
                session = self.sessions[token]
                # Signal the event reader to stop
                session._stop_event.set()
                # Kill PTY first
                try:
                    session.sandbox.pty.kill(session.pty_pid)
                except:
                    pass
                # Then kill sandbox
                session.sandbox.kill()
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
