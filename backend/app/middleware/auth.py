from fastapi import Request, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Dict, Any, Optional
import logging
from app.core.supabase_auth import get_supabase_auth, SupabaseAuthValidator

logger = logging.getLogger(__name__)

# Security scheme for FastAPI docs
security = HTTPBearer()

class AuthMiddleware:
    """FastAPI middleware for Supabase JWT authentication"""
    
    def __init__(self):
        self.auth_validator = get_supabase_auth()
    
    async def authenticate_request(
        self, 
        credentials: HTTPAuthorizationCredentials = Depends(security)
    ) -> Dict[str, Any]:
        """Authenticate incoming request with Supabase JWT"""
        
        if not credentials:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Missing Authorization header",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        token = credentials.credentials
        
        try:
            # Validate JWT token
            payload = await self.auth_validator.validate_token(token)
            
            # Extract user information
            user_info = self.auth_validator.extract_user_info(payload)
            
            logger.info(f"Authenticated user: {user_info['user_id']}")
            return user_info
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Authentication error: {e}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication failed",
                headers={"WWW-Authenticate": "Bearer"},
            )

# Global middleware instance
auth_middleware = AuthMiddleware()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> Dict[str, Any]:
    """Dependency to get current authenticated user"""
    return await auth_middleware.authenticate_request(credentials)

async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False))
) -> Optional[Dict[str, Any]]:
    """Dependency to get current user (optional, for public endpoints)"""
    if not credentials:
        return None
    
    try:
        return await auth_middleware.authenticate_request(credentials)
    except HTTPException:
        return None

def require_role(required_role: str):
    """Dependency factory for role-based access control"""
    async def role_checker(current_user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
        user_role = current_user.get('role', 'authenticated')
        app_metadata = current_user.get('app_metadata', {})
        user_roles = app_metadata.get('roles', [user_role])
        
        # Check if user has required role
        if required_role not in user_roles and user_role != required_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required role: {required_role}"
            )
        
        return current_user
    
    return role_checker

def require_admin():
    """Dependency for admin-only endpoints"""
    return require_role('admin')

def require_developer():
    """Dependency for developer-level access"""
    async def dev_checker(current_user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
        user_role = current_user.get('role', 'authenticated')
        app_metadata = current_user.get('app_metadata', {})
        user_roles = app_metadata.get('roles', [user_role])
        
        # Allow admin or developer roles
        allowed_roles = ['admin', 'developer']
        if not any(role in user_roles for role in allowed_roles) and user_role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied. Developer or admin role required"
            )
        
        return current_user
    
    return dev_checker