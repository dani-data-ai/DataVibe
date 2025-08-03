from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict, Any
from app.services.database_cloud import CloudDatabaseService
from app.middleware.auth import get_current_user

router = APIRouter()

class ConnectionTestRequest(BaseModel):
    connection_string: str
    name: str = "Test Connection"

class DatabaseQueryRequest(BaseModel):
    connection_string: str
    sql_query: str

@router.post("/test-connection")
async def test_database_connection(
    request: ConnectionTestRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Test connection to a remote cloud database"""
    try:
        result = CloudDatabaseService.test_connection(request.connection_string)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/execute-query") 
async def execute_database_query(request: DatabaseQueryRequest):
    """Execute read-only query on remote database"""
    try:
        result = CloudDatabaseService.execute_read_only_query(
            request.connection_string, 
            request.sql_query
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/schema")
async def get_database_schema(request: ConnectionTestRequest):
    """Get schema information from remote database"""
    try:
        result = CloudDatabaseService.get_schema_info(request.connection_string)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))