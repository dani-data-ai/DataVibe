# DataVibe Authentication Flow Documentation

## Overview

DataVibe uses **Supabase Authentication** with **JWT token validation** to provide secure, cloud-only authentication. The system implements role-based access control and encrypted session management.

## Architecture

### Frontend (Next.js)
- **AuthContext**: Manages user state and authentication operations
- **Supabase Client**: Handles sign-up, sign-in, sign-out, and password reset
- **Session Management**: Stores JWT tokens in sessionStorage for cloud-only compliance
- **API Client**: Automatically injects JWT tokens into requests

### Backend (FastAPI)
- **JWT Validation Middleware**: Validates Supabase JWT tokens using JWKS
- **User Context**: Attaches authenticated user info to requests
- **Role-Based Access**: Controls access based on user roles (admin, developer, viewer)
- **Session Management**: Creates encrypted database sessions tied to authenticated users

## Authentication Flow

### 1. User Registration
```
User → Frontend → Supabase Auth → Email Confirmation → Account Active
```

### 2. User Sign-In
```
User → Frontend → Supabase Auth → JWT Token → SessionStorage → API Requests
```

### 3. API Request Flow
```
Frontend → JWT Token → Backend Middleware → Validation → User Context → Protected Route
```

### 4. Database Session Creation
```
Authenticated User → Session Request → Encrypted Session → Database Connection
```

## Components

### Frontend Components

#### AuthContext (`src/contexts/AuthContext.tsx`)
- Manages global authentication state
- Provides sign-up, sign-in, sign-out, and password reset functions
- Handles JWT token storage and retrieval
- Automatically refreshes sessions

#### AuthModal (`src/components/auth/AuthModal.tsx`)
- Modal interface for authentication
- Supports sign-in, sign-up, and password reset modes
- Responsive UI with error handling

#### LoginForm (`src/components/auth/LoginForm.tsx`)
- Email/password sign-in form
- Form validation and error display
- Loading states and user feedback

#### SignUpForm (`src/components/auth/SignUpForm.tsx`)
- User registration form
- Password confirmation and validation
- Email verification flow

#### PasswordResetForm (`src/components/auth/PasswordResetForm.tsx`)
- Password reset request form
- Email-based reset flow
- Success confirmation

### Backend Components

#### Supabase Auth Validator (`app/core/supabase_auth.py`)
```python
class SupabaseAuthValidator:
    def configure(self, supabase_url: str, jwt_secret: str)
    async def validate_jwt(self, token: str) -> Dict[str, Any]
    async def get_jwks(self) -> Dict[str, Any]
```

#### Authentication Middleware (`app/middleware/auth.py`)
```python
async def get_current_user(credentials: HTTPAuthorizationCredentials) -> Dict[str, Any]
async def get_admin_user(current_user: Dict[str, Any]) -> Dict[str, Any]
```

#### Security Core (`app/core/security.py`)
```python
def encrypt_data(data: str) -> str
def decrypt_data(encrypted_data: str) -> str
def generate_session_id() -> str
```

## API Endpoints

### Authentication Endpoints
- `GET /auth/status` - Check authentication status
- `GET /auth/me` - Get current user info
- `GET /auth/test-protected` - Test protected route

### Session Management
- `POST /sessions/create` - Create encrypted database session
- `GET /sessions/list` - List user sessions
- `DELETE /sessions/{session_id}` - Destroy session

### Query Operations
- `POST /query/preview` - Generate SQL preview (requires session)
- `POST /query/execute` - Execute SQL query (requires session)

## Security Features

### 1. JWT Token Validation
- Validates Supabase JWT tokens using JWKS
- Verifies token signature, expiration, and issuer
- Extracts user metadata and roles

### 2. Encrypted Session Management
- Database connection strings encrypted with Fernet
- Session IDs are cryptographically secure
- Sessions tied to authenticated users

### 3. Role-Based Access Control
- **admin**: Full system access
- **developer**: Database and query access
- **viewer**: Read-only access

### 4. Cloud-Only Architecture
- No local storage of credentials
- Session data encrypted in memory
- Supabase handles authentication infrastructure

## Configuration

### Environment Variables

#### Frontend (.env.local)
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=http://localhost:8000
```

#### Backend (.env)
```bash
SUPABASE_URL=your_supabase_url
SUPABASE_JWT_SECRET=your_jwt_secret
JWT_SECRET=runtime_generated_secret
```

## Error Handling

### Frontend Error States
- Invalid credentials
- Network connectivity issues
- Token expiration
- Account not confirmed

### Backend Error Responses
- `401 Unauthorized` - Invalid or missing token
- `403 Forbidden` - Insufficient permissions
- `422 Unprocessable Entity` - Invalid request data

## Testing

### Manual Testing Flow
1. Start backend server with authentication configured
2. Start frontend with Supabase configuration
3. Test user registration flow
4. Test sign-in with valid credentials
5. Test protected API endpoints
6. Test session creation and database connectivity
7. Test sign-out and token cleanup

### Automated Tests
- JWT token validation tests
- Session encryption/decryption tests
- Role-based access control tests
- API endpoint authentication tests

## Troubleshooting

### Common Issues

#### "Invalid JWT token"
- Check Supabase configuration
- Verify JWT secret matches
- Ensure token is not expired

#### "Session creation failed"
- Verify user is authenticated
- Check database connection string format
- Ensure cloud-only database provider

#### "Authentication modal not working"
- Check Supabase URL and anon key
- Verify network connectivity
- Check browser developer tools for errors

### Debug Steps
1. Check browser sessionStorage for JWT token
2. Verify backend logs for authentication errors
3. Test Supabase configuration in browser console
4. Validate environment variables are loaded

## Security Best Practices

1. **Never commit secrets** - Use environment variables
2. **Validate all inputs** - Both frontend and backend
3. **Use HTTPS in production** - Encrypt all communications
4. **Rotate JWT secrets** - Regular secret rotation
5. **Monitor authentication** - Log failed attempts
6. **Session timeout** - Implement reasonable session limits

## Future Enhancements

- Multi-factor authentication (MFA)
- OAuth provider integration (Google, GitHub)
- Session activity monitoring
- Advanced role permissions
- Audit logging for authentication events