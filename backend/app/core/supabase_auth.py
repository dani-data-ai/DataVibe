import jwt
import httpx
import asyncio
from typing import Dict, Any, Optional
from fastapi import HTTPException, status
from datetime import datetime
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

class SupabaseAuthValidator:
    """Validates Supabase JWT tokens without requiring secrets"""
    
    def __init__(self):
        self.supabase_url = None
        self.jwt_secret = None
        self._jwks_cache = {}
        self._cache_timestamp = None
        
    def configure(self, supabase_url: str, jwt_secret: str):
        """Configure Supabase settings at runtime"""
        self.supabase_url = supabase_url.rstrip('/')
        self.jwt_secret = jwt_secret
        logger.info(f"Supabase auth configured for: {supabase_url}")
    
    async def get_jwks(self) -> Dict[str, Any]:
        """Get JSON Web Key Set from Supabase (cached)"""
        if not self.supabase_url:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Supabase not configured. Please provide SUPABASE_URL and SUPABASE_JWT_SECRET"
            )
        
        # Cache JWKS for 1 hour
        now = datetime.now().timestamp()
        if self._jwks_cache and self._cache_timestamp and (now - self._cache_timestamp < 3600):
            return self._jwks_cache
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(f"{self.supabase_url}/auth/v1/jwks")
                response.raise_for_status()
                
                self._jwks_cache = response.json()
                self._cache_timestamp = now
                return self._jwks_cache
                
        except httpx.RequestError as e:
            logger.error(f"Failed to fetch JWKS: {e}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Unable to verify authentication. Please try again."
            )
    
    def validate_jwt_with_secret(self, token: str) -> Dict[str, Any]:
        """Validate JWT using Supabase JWT secret (faster method)"""
        if not self.jwt_secret:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Supabase JWT secret not configured"
            )
        
        try:
            # Decode JWT with Supabase secret
            payload = jwt.decode(
                token,
                self.jwt_secret,
                algorithms=["HS256"],
                audience="authenticated"
            )
            
            # Validate required claims
            required_claims = ['sub', 'aud', 'exp', 'iat']
            for claim in required_claims:
                if claim not in payload:
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail=f"Invalid token: missing {claim} claim"
                    )
            
            # Validate audience
            if payload.get('aud') != 'authenticated':
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token audience"
                )
            
            return payload
            
        except jwt.ExpiredSignatureError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired"
            )
        except jwt.InvalidTokenError as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid token: {str(e)}"
            )
    
    async def validate_jwt_with_jwks(self, token: str) -> Dict[str, Any]:
        """Validate JWT using JWKS (more secure but slower)"""
        try:
            # Get token header to find key ID
            unverified_header = jwt.get_unverified_header(token)
            kid = unverified_header.get('kid')
            
            if not kid:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token: missing key ID"
                )
            
            # Get JWKS and find matching key
            jwks = await self.get_jwks()
            key = None
            
            for jwk in jwks.get('keys', []):
                if jwk.get('kid') == kid:
                    key = jwt.algorithms.RSAAlgorithm.from_jwk(jwk)
                    break
            
            if not key:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token: key not found"
                )
            
            # Verify token with public key
            payload = jwt.decode(
                token,
                key,
                algorithms=["RS256"],
                audience="authenticated"
            )
            
            return payload
            
        except jwt.ExpiredSignatureError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired"
            )
        except jwt.InvalidTokenError as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid token: {str(e)}"
            )
    
    async def validate_token(self, token: str, use_jwks: bool = False) -> Dict[str, Any]:
        """Validate Supabase JWT token"""
        if not token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Missing authentication token"
            )
        
        # Choose validation method
        if use_jwks and self.supabase_url:
            return await self.validate_jwt_with_jwks(token)
        elif self.jwt_secret:
            return self.validate_jwt_with_secret(token)
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Authentication not properly configured"
            )
    
    def extract_user_info(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Extract user information from JWT payload"""
        return {
            'user_id': payload.get('sub'),
            'email': payload.get('email'),
            'role': payload.get('role', 'authenticated'),
            'aud': payload.get('aud'),
            'exp': payload.get('exp'),
            'iat': payload.get('iat'),
            'app_metadata': payload.get('app_metadata', {}),
            'user_metadata': payload.get('user_metadata', {})
        }

# Global instance
supabase_auth = SupabaseAuthValidator()

def get_supabase_auth() -> SupabaseAuthValidator:
    """Get configured Supabase auth validator"""
    return supabase_auth