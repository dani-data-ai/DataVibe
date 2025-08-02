from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, Dict, Any
from app.core.security import secure_context
from app.services.database_cloud import CloudDatabaseService
from app.middleware.auth import get_current_user

router = APIRouter()

class CreateSessionRequest(BaseModel):
    connection_string: str
    connection_name: Optional[str] = "Database Connection"

class SessionResponse(BaseModel):
    session_id: str
    session_info: Dict[str, Any]
    success: bool
    message: str

class SessionInfoResponse(BaseModel):
    session_info: Optional[Dict[str, Any]]
    connected: bool

@router.post("/create", response_model=SessionResponse)
async def create_database_session(
    request: CreateSessionRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Create secure session with encrypted database connection"""
    try:
        user_id = current_user['user_id']
        
        # Validate connection first
        test_result = CloudDatabaseService.test_connection(request.connection_string)
        
        if not test_result["success"]:
            raise HTTPException(
                status_code=400, 
                detail=f"Database connection failed: {test_result['message']}"
            )
        
        # Create secure session
        session_id = secure_context.create_session(
            user_id=user_id,
            connection_data={
                'connection_string': request.connection_string,
                'provider': test_result.get('provider', 'Unknown'),
                'name': request.connection_name
            }
        )
        
        # Get session info (without sensitive data)
        session_info = secure_context.get_session_info(session_id, user_id)
        
        return SessionResponse(
            session_id=session_id,
            session_info=session_info,
            success=True,
            message=f"Connected successfully to {test_result.get('provider', 'database')}"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create session: {str(e)}")

@router.get("/list", response_model=list)
async def list_user_sessions(current_user: Dict[str, Any] = Depends(get_current_user)):
    """List all active sessions for current user"""
    try:
        user_id = current_user['user_id']
        
        # Get all sessions for user (basic info only)
        user_sessions = []
        for session_id, session_data in secure_context._sessions.items():
            if session_data.get('user_id') == user_id:
                session_info = secure_context.get_session_info(session_id, user_id)
                if session_info:
                    user_sessions.append(session_info)
        
        return user_sessions
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list sessions: {str(e)}")

@router.delete("/{session_id}")
async def destroy_session(
    session_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Destroy specific session"""
    try:
        user_id = current_user['user_id']
        
        # Verify session belongs to user
        session_info = secure_context.get_session_info(session_id, user_id)
        if not session_info:
            raise HTTPException(status_code=404, detail="Session not found")
        
        success = secure_context.destroy_session(session_id)
        
        return {
            "success": success,
            "message": "Session destroyed successfully" if success else "Session not found"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to destroy session: {str(e)}")

def get_user_session(
    session_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> str:
    """Dependency to get connection string for specific session"""
    user_id = current_user['user_id']
    connection_string = secure_context.get_connection_string(session_id, user_id)
    
    if not connection_string:
        raise HTTPException(
            status_code=404, 
            detail="Session not found or expired. Please create a new session."
        )
    
    return connection_string