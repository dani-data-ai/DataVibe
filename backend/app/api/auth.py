from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict, Any, Optional
from app.core.supabase_auth import get_supabase_auth
from app.middleware.auth import get_current_user, get_current_user_optional

router = APIRouter()

class AuthConfigRequest(BaseModel):
    supabase_url: str
    jwt_secret: str

class AuthStatusResponse(BaseModel):
    configured: bool
    supabase_url: Optional[str] = None
    message: str

class UserProfileResponse(BaseModel):
    user_id: str
    email: Optional[str]
    role: str
    app_metadata: Dict[str, Any]
    user_metadata: Dict[str, Any]

@router.post("/configure")
async def configure_supabase_auth(request: AuthConfigRequest):
    """Configure Supabase authentication at runtime"""
    try:
        auth_validator = get_supabase_auth()
        auth_validator.configure(request.supabase_url, request.jwt_secret)
        
        return {
            "success": True,
            "message": "Supabase authentication configured successfully",
            "supabase_url": request.supabase_url
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Configuration failed: {str(e)}")

@router.get("/status", response_model=AuthStatusResponse)
async def get_auth_status():
    """Get current authentication configuration status"""
    auth_validator = get_supabase_auth()
    
    return AuthStatusResponse(
        configured=auth_validator.supabase_url is not None,
        supabase_url=auth_validator.supabase_url,
        message="Authentication is configured" if auth_validator.supabase_url else "Authentication not configured"
    )

@router.get("/me", response_model=UserProfileResponse)
async def get_current_user_profile(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Get current authenticated user profile"""
    return UserProfileResponse(
        user_id=current_user['user_id'],
        email=current_user.get('email'),
        role=current_user.get('role', 'authenticated'),
        app_metadata=current_user.get('app_metadata', {}),
        user_metadata=current_user.get('user_metadata', {})
    )

@router.post("/validate-token")
async def validate_token(current_user: Optional[Dict[str, Any]] = Depends(get_current_user_optional)):
    """Validate current token (public endpoint for token testing)"""
    if current_user:
        return {
            "valid": True,
            "user_id": current_user['user_id'],
            "email": current_user.get('email'),
            "role": current_user.get('role', 'authenticated')
        }
    else:
        return {
            "valid": False,
            "message": "Invalid or missing token"
        }

@router.get("/test-protected")
async def test_protected_endpoint(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Test endpoint for verifying authentication works"""
    return {
        "message": "Authentication successful!",
        "user_id": current_user['user_id'],
        "email": current_user.get('email'),
        "role": current_user.get('role')
    }