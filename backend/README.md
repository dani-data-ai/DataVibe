# DataVibe Backend

FastAPI Python backend for the DataVibe AI database assistant.

## Features

- FastAPI framework with automatic OpenAPI documentation
- JWT-based authentication
- Database connection management
- LLM integration for natural language to SQL conversion
- Query execution with safety checks
- Schema change proposal system
- Audit logging
- Role-based access control

## Project Structure

```
backend/
├── app/
│   ├── api/                # API route handlers
│   │   ├── auth.py         # Authentication endpoints
│   │   ├── database.py     # Database connection endpoints
│   │   ├── query.py        # Query execution endpoints
│   │   └── schema.py       # Schema modification endpoints
│   ├── core/               # Core configuration and database
│   │   ├── config.py       # Application settings
│   │   └── database.py     # Database connection setup
│   ├── models/             # SQLAlchemy models
│   │   ├── user.py         # User model
│   │   └── connection.py   # Database connection model
│   ├── schemas/            # Pydantic schemas
│   │   ├── user.py         # User schemas
│   │   └── query.py        # Query schemas
│   ├── services/           # Business logic
│   │   ├── auth.py         # Authentication service
│   │   ├── database.py     # Database service
│   │   ├── query.py        # Query processing service
│   │   └── schema.py       # Schema modification service
│   └── utils/              # Utility functions
├── tests/                  # Test files
├── main.py                 # FastAPI application entry point
├── requirements.txt        # Python dependencies
└── Dockerfile             # Container configuration
```

## Development

```bash
# Install dependencies
pip install -r requirements.txt

# Start development server
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Run tests
pytest

# Generate database migrations
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head
```

## Environment Variables

Required environment variables (see `.env.example`):

- `DATABASE_URL`: PostgreSQL connection string
- `SECRET_KEY`: JWT signing secret
- `OPENAI_API_KEY`: OpenAI API key for LLM integration
- `ANTHROPIC_API_KEY`: Anthropic API key for LLM integration

## API Documentation

When running the server, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Key Services

### Authentication Service
- User registration and login
- JWT token generation and validation
- Password hashing and verification

### Database Service
- Secure database connection management
- Connection testing and validation
- Schema introspection

### Query Service
- Natural language to SQL conversion using LLMs
- Query safety validation
- Read-only execution enforcement
- Result formatting and explanation

### Schema Service
- Schema change proposal generation
- Approval workflow management
- Migration execution in development environments

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- SQL injection prevention
- Read-only enforcement for production databases
- Audit logging for all operations
- Role-based access control