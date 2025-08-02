from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime

class QueryRequest(BaseModel):
    natural_language: str
    connection_id: int
    confirm_execution: bool = False

class QueryResponse(BaseModel):
    query_id: str
    sql_generated: str
    explanation: str
    data: List[Dict[str, Any]]
    columns: List[str]
    row_count: int
    execution_time: float
    warnings: Optional[List[str]] = None

class QueryPreview(BaseModel):
    query_id: str
    sql_generated: str
    explanation: str
    estimated_rows: Optional[int] = None
    warnings: Optional[List[str]] = None

class QueryHistory(BaseModel):
    id: str
    natural_language: str
    sql_query: str
    success: bool
    row_count: Optional[int] = None
    execution_time: Optional[float] = None
    created_at: datetime
    connection_name: str