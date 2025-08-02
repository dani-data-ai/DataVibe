from cryptography.fernet import Fernet
from typing import Dict, Any, Optional
import secrets
import os
from datetime import datetime, timedelta
import jwt
from app.core.config import settings

class SecureContextManager:
    """Manages secure, encrypted context without local persistence"""
    
    def __init__(self):
        # Generate runtime encryption key (never persisted)
        self._encryption_key = Fernet.generate_key()
        self._cipher = Fernet(self._encryption_key)
        # In-memory session store (cleared on restart)
        self._sessions: Dict[str, Dict[str, Any]] = {}
    
    def create_session(self, user_id: str, connection_data: Dict[str, Any]) -> str:
        """Create encrypted session with connection context"""
        session_id = secrets.token_urlsafe(32)
        
        # Encrypt sensitive connection data
        connection_string = connection_data.get('connection_string', '')
        encrypted_connection = self._cipher.encrypt(connection_string.encode()).decode()
        
        session_data = {
            'user_id': user_id,
            'encrypted_connection': encrypted_connection,
            'provider': connection_data.get('provider', 'unknown'),
            'created_at': datetime.utcnow(),
            'last_accessed': datetime.utcnow()
        }
        
        self._sessions[session_id] = session_data
        return session_id
    
    def get_connection_string(self, session_id: str, user_id: str) -> Optional[str]:
        """Retrieve and decrypt connection string for session"""
        session = self._sessions.get(session_id)
        
        if not session or session['user_id'] != user_id:
            return None
        
        # Check session timeout (1 hour)
        if datetime.utcnow() - session['last_accessed'] > timedelta(hours=1):
            self.destroy_session(session_id)
            return None
        
        # Update last accessed
        session['last_accessed'] = datetime.utcnow()
        
        # Decrypt connection string
        try:
            encrypted_data = session['encrypted_connection'].encode()
            decrypted = self._cipher.decrypt(encrypted_data).decode()
            return decrypted
        except Exception:
            return None
    
    def get_session_info(self, session_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        """Get session metadata without sensitive data"""
        session = self._sessions.get(session_id)
        
        if not session or session['user_id'] != user_id:
            return None
        
        return {
            'session_id': session_id,
            'provider': session['provider'],
            'created_at': session['created_at'].isoformat(),
            'last_accessed': session['last_accessed'].isoformat()
        }
    
    def destroy_session(self, session_id: str) -> bool:
        """Destroy session and clear sensitive data"""
        if session_id in self._sessions:
            del self._sessions[session_id]
            return True
        return False
    
    def cleanup_expired_sessions(self):
        """Remove expired sessions (called periodically)"""
        now = datetime.utcnow()
        expired_sessions = [
            sid for sid, session in self._sessions.items()
            if now - session['last_accessed'] > timedelta(hours=1)
        ]
        
        for sid in expired_sessions:
            del self._sessions[sid]
        
        return len(expired_sessions)

# Global instance (in-memory only)
secure_context = SecureContextManager()

# Global runtime secret (generated once per app start)
_JWT_SECRET = os.environ.get('JWT_SECRET', secrets.token_urlsafe(32))

def create_session_token(session_id: str, user_id: str) -> str:
    """Create JWT token for session identification"""
    payload = {
        'session_id': session_id,
        'user_id': user_id,
        'exp': datetime.utcnow() + timedelta(hours=1),
        'iat': datetime.utcnow()
    }
    
    return jwt.encode(payload, _JWT_SECRET, algorithm='HS256')

def verify_session_token(token: str) -> Optional[Dict[str, str]]:
    """Verify and decode session token"""
    try:
        payload = jwt.decode(token, _JWT_SECRET, algorithms=['HS256'])
        return {
            'session_id': payload['session_id'],
            'user_id': payload['user_id']
        }
    except jwt.InvalidTokenError:
        return None