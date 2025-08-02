from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Dict, Any
from app.services.llm_service import llm_service
from app.services.database_cloud import CloudDatabaseService
from app.services.audit_service import audit_service
from app.api.sessions import get_user_session
from app.middleware.auth import get_current_user
import uuid

router = APIRouter()

class NaturalLanguageQueryRequest(BaseModel):
    prompt: str
    session_id: str

class QueryPreviewResponse(BaseModel):
    query_id: str
    sql_generated: str
    explanation: str
    warnings: List[str]
    confidence: float

class QueryExecutionRequest(BaseModel):
    query_id: str
    sql_query: str
    confirm_execution: bool = False

class QueryExecutionResponse(BaseModel):
    success: bool
    data: List[Dict[str, Any]]
    columns: List[str]
    row_count: int
    explanation: str
    follow_up_suggestions: List[str]

# In-memory storage for query previews (no local persistence)
_query_cache = {}

@router.post("/preview", response_model=QueryPreviewResponse)
async def preview_natural_language_query(
    request: NaturalLanguageQueryRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Convert natural language to SQL preview using secure session context"""
    try:
        user_id = current_user['user_id']
        
        # Get connection string for the session
        connection_string = get_user_session(request.session_id, current_user)
        
        # Get schema info for context
        schema_result = CloudDatabaseService.get_schema_info(connection_string)
        schema_info = schema_result if schema_result["success"] else None
        
        # Generate SQL using real LLM service
        llm_result = await llm_service.natural_language_to_sql(
            request.prompt, 
            schema_info
        )
        
        if not llm_result["success"]:
            raise HTTPException(status_code=400, detail="Failed to generate SQL")
        
        query_id = str(uuid.uuid4())
        
        # Store in cache temporarily (associated with session and user)
        _query_cache[query_id] = {
            "sql": llm_result["sql"],
            "prompt": request.prompt,
            "session_id": request.session_id,
            "user_id": user_id
        }
        
        # Log audit event
        audit_service.log_query_preview(
            user_id=user_id,
            session_id=request.session_id,
            natural_language=request.prompt,
            generated_sql=llm_result["sql"],
            confidence=llm_result["confidence"]
        )
        
        return QueryPreviewResponse(
            query_id=query_id,
            sql_generated=llm_result["sql"],
            explanation=llm_result["explanation"],
            warnings=llm_result["warnings"],
            confidence=llm_result["confidence"]
        )
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/execute", response_model=QueryExecutionResponse)
async def execute_query(
    request: QueryExecutionRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Execute confirmed SQL query using secure session context"""
    try:
        user_id = current_user['user_id']
        
        if not request.confirm_execution:
            raise HTTPException(
                status_code=400, 
                detail="Query execution must be confirmed"
            )
        
        # Verify query belongs to current user and get session info
        cached_query = _query_cache.get(request.query_id)
        if not cached_query or cached_query.get("user_id") != user_id:
            raise HTTPException(
                status_code=403, 
                detail="Query not found or not authorized for this user"
            )
        
        # Get connection string for the session
        connection_string = get_user_session(cached_query["session_id"], current_user)
        
        # Execute the query
        result = CloudDatabaseService.execute_read_only_query(
            connection_string,
            request.sql_query
        )
        
        if not result["success"]:
            raise HTTPException(status_code=400, detail=result["message"])
        
        # Get cached prompt for context
        original_prompt = cached_query["prompt"]
        
        # Generate explanations and suggestions
        explanation = await llm_service.explain_results(
            result["data"], 
            request.sql_query, 
            original_prompt
        )
        
        suggestions = await llm_service.suggest_followup_questions(
            result["data"], 
            original_prompt
        )
        
        # Clean up cache
        del _query_cache[request.query_id]
        
        return QueryExecutionResponse(
            success=True,
            data=result["data"],
            columns=result["columns"],
            row_count=result["row_count"],
            explanation=explanation,
            follow_up_suggestions=suggestions
        )
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/providers-info")
async def get_database_providers_info():
    """Get information about supported free-tier database providers"""
    return {
        "free_tier_providers": [
            {
                "name": "Neon",
                "description": "Serverless PostgreSQL with generous free tier",
                "url": "https://neon.tech",
                "connection_format": "postgresql://username:password@hostname.neon.tech/database",
                "free_tier": True
            },
            {
                "name": "Supabase",
                "description": "Open source Firebase alternative with PostgreSQL",
                "url": "https://supabase.com",
                "connection_format": "postgresql://postgres:password@hostname.supabase.co:5432/postgres",
                "free_tier": True
            },
            {
                "name": "PlanetScale",
                "description": "MySQL-compatible serverless database platform",
                "url": "https://planetscale.com",
                "connection_format": "mysql://username:password@hostname.psdb.cloud/database",
                "free_tier": True
            }
        ],
        "note": "All providers listed offer free tiers. Connection strings must point to cloud-hosted databases only."
    }