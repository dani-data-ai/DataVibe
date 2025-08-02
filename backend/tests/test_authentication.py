import pytest
import jwt
import json
import os
from unittest.mock import Mock, patch, AsyncMock
from datetime import datetime, timedelta
from fastapi.testclient import TestClient
from fastapi import HTTPException

from app.core.supabase_auth import SupabaseAuthValidator
from app.middleware.auth import get_current_user, get_admin_user
from app.core.security import encrypt_data, decrypt_data, generate_session_id


class TestSupabaseAuthValidator:
    """Test Supabase JWT validation functionality"""
    
    def setup_method(self):
        self.validator = SupabaseAuthValidator()
        self.test_supabase_url = "https://test.supabase.co"
        self.test_jwt_secret = "test-secret-key-at-least-32-chars"
        
    def test_configure_validator(self):
        """Test validator configuration"""
        self.validator.configure(self.test_supabase_url, self.test_jwt_secret)
        assert self.validator.supabase_url == self.test_supabase_url
        assert self.validator.jwt_secret == self.test_jwt_secret
        
    def test_configure_strips_trailing_slash(self):
        """Test URL normalization"""
        self.validator.configure("https://test.supabase.co/", self.test_jwt_secret)
        assert self.validator.supabase_url == "https://test.supabase.co"
        
    def create_test_jwt(self, payload=None, secret=None):
        """Helper to create test JWT tokens"""
        if payload is None:
            payload = {
                "sub": "test-user-id",
                "email": "test@example.com",
                "role": "authenticated",
                "iat": datetime.utcnow().timestamp(),
                "exp": (datetime.utcnow() + timedelta(hours=1)).timestamp(),
                "iss": "https://test.supabase.co/auth/v1"
            }
        if secret is None:
            secret = self.test_jwt_secret
        return jwt.encode(payload, secret, algorithm="HS256")
        
    @pytest.mark.asyncio
    async def test_validate_jwt_success(self):
        """Test successful JWT validation"""
        self.validator.configure(self.test_supabase_url, self.test_jwt_secret)
        token = self.create_test_jwt()
        
        result = await self.validator.validate_jwt(token)
        
        assert result["sub"] == "test-user-id"
        assert result["email"] == "test@example.com"
        assert result["role"] == "authenticated"
        
    @pytest.mark.asyncio
    async def test_validate_jwt_invalid_secret(self):
        """Test JWT validation with wrong secret"""
        self.validator.configure(self.test_supabase_url, "wrong-secret")
        token = self.create_test_jwt()
        
        with pytest.raises(HTTPException) as exc_info:
            await self.validator.validate_jwt(token)
        assert exc_info.value.status_code == 401
        
    @pytest.mark.asyncio
    async def test_validate_jwt_expired(self):
        """Test JWT validation with expired token"""
        self.validator.configure(self.test_supabase_url, self.test_jwt_secret)
        
        expired_payload = {
            "sub": "test-user-id",
            "email": "test@example.com", 
            "exp": (datetime.utcnow() - timedelta(hours=1)).timestamp()
        }
        token = self.create_test_jwt(expired_payload)
        
        with pytest.raises(HTTPException) as exc_info:
            await self.validator.validate_jwt(token)
        assert exc_info.value.status_code == 401
        
    @pytest.mark.asyncio
    async def test_validate_jwt_malformed(self):
        """Test JWT validation with malformed token"""
        self.validator.configure(self.test_supabase_url, self.test_jwt_secret)
        
        with pytest.raises(HTTPException) as exc_info:
            await self.validator.validate_jwt("invalid-jwt-token")
        assert exc_info.value.status_code == 401


class TestAuthenticationMiddleware:
    """Test authentication middleware functionality"""
    
    def setup_method(self):
        self.validator = SupabaseAuthValidator()
        self.test_jwt_secret = "test-secret-key-at-least-32-chars"
        
    def create_mock_credentials(self, token):
        """Create mock HTTPAuthorizationCredentials"""
        mock_creds = Mock()
        mock_creds.credentials = token
        return mock_creds
        
    @pytest.mark.asyncio
    async def test_get_current_user_success(self):
        """Test successful user authentication"""
        # Configure validator
        os.environ["SUPABASE_URL"] = "https://test.supabase.co"
        os.environ["SUPABASE_JWT_SECRET"] = self.test_jwt_secret
        
        # Create valid JWT
        payload = {
            "sub": "test-user-id",
            "email": "test@example.com",
            "role": "authenticated",
            "user_metadata": {"role": "developer"},
            "iat": datetime.utcnow().timestamp(),
            "exp": (datetime.utcnow() + timedelta(hours=1)).timestamp()
        }
        token = jwt.encode(payload, self.test_jwt_secret, algorithm="HS256")
        credentials = self.create_mock_credentials(token)
        
        # Mock the validator
        with patch('app.middleware.auth.auth_middleware') as mock_auth:
            mock_auth.authenticate_request = AsyncMock(return_value=payload)
            
            result = await get_current_user(credentials)
            assert result["sub"] == "test-user-id"
            assert result["email"] == "test@example.com"
            
    @pytest.mark.asyncio
    async def test_get_current_user_invalid_token(self):
        """Test user authentication with invalid token"""
        credentials = self.create_mock_credentials("invalid-token")
        
        with patch('app.middleware.auth.auth_middleware') as mock_auth:
            mock_auth.authenticate_request = AsyncMock(
                side_effect=HTTPException(status_code=401, detail="Invalid token")
            )
            
            with pytest.raises(HTTPException) as exc_info:
                await get_current_user(credentials)
            assert exc_info.value.status_code == 401
            
    @pytest.mark.asyncio
    async def test_get_admin_user_success(self):
        """Test admin user validation"""
        admin_user = {
            "sub": "admin-user-id",
            "email": "admin@example.com",
            "user_metadata": {"role": "admin"}
        }
        
        result = await get_admin_user(admin_user)
        assert result == admin_user
        
    @pytest.mark.asyncio
    async def test_get_admin_user_insufficient_permissions(self):
        """Test admin validation with non-admin user"""
        regular_user = {
            "sub": "user-id",
            "email": "user@example.com",
            "user_metadata": {"role": "viewer"}
        }
        
        with pytest.raises(HTTPException) as exc_info:
            await get_admin_user(regular_user)
        assert exc_info.value.status_code == 403


class TestSecurityCore:
    """Test security utilities"""
    
    def test_encrypt_decrypt_data(self):
        """Test data encryption and decryption"""
        original_data = "sensitive-connection-string"
        
        # Encrypt data
        encrypted = encrypt_data(original_data)
        assert encrypted != original_data
        assert isinstance(encrypted, str)
        
        # Decrypt data
        decrypted = decrypt_data(encrypted)
        assert decrypted == original_data
        
    def test_generate_session_id(self):
        """Test session ID generation"""
        session_id1 = generate_session_id()
        session_id2 = generate_session_id()
        
        # Should be different
        assert session_id1 != session_id2
        
        # Should be strings
        assert isinstance(session_id1, str)
        assert isinstance(session_id2, str)
        
        # Should have reasonable length
        assert len(session_id1) >= 16
        assert len(session_id2) >= 16


class TestAuthenticationEndpoints:
    """Test authentication API endpoints"""
    
    def setup_method(self):
        """Setup test client and mock authentication"""
        from app.main import app
        self.client = TestClient(app)
        self.test_jwt_secret = "test-secret-key-at-least-32-chars"
        
    def create_auth_headers(self, user_data=None):
        """Create authorization headers with JWT token"""
        if user_data is None:
            user_data = {
                "sub": "test-user-id",
                "email": "test@example.com",
                "role": "authenticated",
                "user_metadata": {"role": "developer"}
            }
            
        token = jwt.encode(user_data, self.test_jwt_secret, algorithm="HS256")
        return {"Authorization": f"Bearer {token}"}
        
    def test_auth_status_unauthenticated(self):
        """Test auth status without authentication"""
        response = self.client.get("/auth/status")
        assert response.status_code == 401
        
    @patch('app.middleware.auth.auth_middleware')
    def test_auth_status_authenticated(self, mock_auth):
        """Test auth status with valid authentication"""
        user_data = {"sub": "test-user", "email": "test@example.com"}
        mock_auth.authenticate_request = AsyncMock(return_value=user_data)
        
        headers = self.create_auth_headers(user_data)
        response = self.client.get("/auth/status", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["authenticated"] is True
        assert data["user"]["sub"] == "test-user"
        
    @patch('app.middleware.auth.auth_middleware')
    def test_me_endpoint(self, mock_auth):
        """Test /auth/me endpoint"""
        user_data = {
            "sub": "test-user-id",
            "email": "test@example.com",
            "user_metadata": {"role": "developer"}
        }
        mock_auth.authenticate_request = AsyncMock(return_value=user_data)
        
        headers = self.create_auth_headers(user_data)
        response = self.client.get("/auth/me", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["sub"] == "test-user-id"
        assert data["email"] == "test@example.com"
        
    @patch('app.middleware.auth.auth_middleware')
    def test_test_protected_endpoint(self, mock_auth):
        """Test protected endpoint access"""
        user_data = {"sub": "test-user", "email": "test@example.com"}
        mock_auth.authenticate_request = AsyncMock(return_value=user_data)
        
        headers = self.create_auth_headers(user_data)
        response = self.client.get("/auth/test-protected", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "user" in data


class TestSessionManagement:
    """Test authenticated session management"""
    
    def setup_method(self):
        from app.main import app
        self.client = TestClient(app)
        self.test_jwt_secret = "test-secret-key-at-least-32-chars"
        
    def create_auth_headers(self, role="developer"):
        """Create auth headers with specified role"""
        user_data = {
            "sub": "test-user-id",
            "email": "test@example.com",
            "user_metadata": {"role": role}
        }
        token = jwt.encode(user_data, self.test_jwt_secret, algorithm="HS256")
        return {"Authorization": f"Bearer {token}"}
        
    @patch('app.middleware.auth.auth_middleware')
    def test_create_session_success(self, mock_auth):
        """Test successful session creation"""
        user_data = {"sub": "test-user", "user_metadata": {"role": "developer"}}
        mock_auth.authenticate_request = AsyncMock(return_value=user_data)
        
        headers = self.create_auth_headers()
        session_data = {
            "connection_string": "postgresql://user:pass@host.neon.tech/db",
            "name": "Test Session"
        }
        
        with patch('app.services.database.test_connection') as mock_test:
            mock_test.return_value = {"success": True, "provider": "postgresql"}
            
            response = self.client.post("/sessions/create", 
                                      json=session_data, 
                                      headers=headers)
            
            assert response.status_code == 200
            data = response.json()
            assert "session_id" in data
            assert data["name"] == "Test Session"
            
    @patch('app.middleware.auth.auth_middleware')
    def test_create_session_invalid_connection(self, mock_auth):
        """Test session creation with invalid connection"""
        user_data = {"sub": "test-user", "user_metadata": {"role": "developer"}}
        mock_auth.authenticate_request = AsyncMock(return_value=user_data)
        
        headers = self.create_auth_headers()
        session_data = {
            "connection_string": "invalid-connection-string",
            "name": "Test Session"
        }
        
        with patch('app.services.database.test_connection') as mock_test:
            mock_test.return_value = {"success": False, "message": "Invalid connection"}
            
            response = self.client.post("/sessions/create", 
                                      json=session_data, 
                                      headers=headers)
            
            assert response.status_code == 400
            
    def test_create_session_unauthenticated(self):
        """Test session creation without authentication"""
        session_data = {
            "connection_string": "postgresql://user:pass@host.neon.tech/db",
            "name": "Test Session"
        }
        
        response = self.client.post("/sessions/create", json=session_data)
        assert response.status_code == 401


if __name__ == "__main__":
    pytest.main([__file__, "-v"])