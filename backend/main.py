from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.api.database import router as database_router
from app.api.query import router as query_router
from app.api.sessions import router as sessions_router
from app.api.auth import router as auth_router
from app.core.background_tasks import background_tasks

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Start background tasks
    await background_tasks.start_cleanup_scheduler()
    yield
    # Shutdown: Stop background tasks
    await background_tasks.stop_cleanup_scheduler()

app = FastAPI(
    title="DataVibe API",
    description="Cloud-only AI-powered natural language database interaction API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_HOSTS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/auth", tags=["authentication"])
app.include_router(database_router, prefix="/database", tags=["database"])
app.include_router(query_router, prefix="/query", tags=["query"])
app.include_router(sessions_router, prefix="/sessions", tags=["sessions"])

@app.get("/")
async def root():
    return {
        "message": "DataVibe API is running",
        "version": "1.0.0",
        "architecture": "cloud-only",
        "features": [
            "Remote database connections only",
            "Natural language to SQL conversion",
            "Read-only query execution",
            "No local persistence"
        ],
        "docs": "/docs",
        "supported_providers": "/query/providers-info"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy", 
        "version": "1.0.0",
        "architecture": "cloud-only",
        "environment": settings.ENVIRONMENT
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)