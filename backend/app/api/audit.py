from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime
from app.services.audit_service import audit_service, AuditEventType
from app.middleware.auth import get_current_user, require_admin

router = APIRouter()

class AuditLogResponse(BaseModel):
    success: bool
    logs: List[Dict[str, Any]]
    count: int

class AuditStatsResponse(BaseModel):
    success: bool
    statistics: Dict[str, Any]

class AuditExportResponse(BaseModel):
    success: bool
    format: str
    content: str = None
    logs: List[Dict[str, Any]] = None
    count: int
    exported_at: str = None

@router.get("/logs", response_model=AuditLogResponse)
async def get_audit_logs(
    limit: int = Query(100, ge=1, le=1000),
    event_type: Optional[AuditEventType] = Query(None),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get audit logs for current user"""
    user_id = current_user['user_id']
    user_role = current_user.get('role', 'user')
    
    try:
        if user_role == 'admin':
            # Admins can see all logs
            logs = audit_service.get_all_audit_logs(limit=limit, event_type=event_type)
        else:
            # Regular users can only see their own logs
            logs = audit_service.get_user_audit_logs(user_id=user_id, limit=limit)
            
            # Filter by event type if specified
            if event_type:
                logs = [log for log in logs if log['event_type'] == event_type]
        
        return AuditLogResponse(
            success=True,
            logs=logs,
            count=len(logs)
        )
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/logs/session/{session_id}")
async def get_session_audit_logs(
    session_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get audit logs for a specific session"""
    try:
        logs = audit_service.get_session_audit_logs(session_id)
        
        # Filter logs to only show user's own session logs (unless admin)
        user_role = current_user.get('role', 'user')
        user_id = current_user['user_id']
        
        if user_role != 'admin':
            logs = [log for log in logs if log['user_id'] == user_id]
        
        return {
            "success": True,
            "session_id": session_id,
            "logs": logs,
            "count": len(logs)
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/logs/search")
async def search_audit_logs(
    query: str = Query(..., min_length=1),
    limit: int = Query(100, ge=1, le=1000),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Search audit logs with filters"""
    try:
        user_id = current_user['user_id']
        user_role = current_user.get('role', 'user')
        
        # Parse dates
        start_dt = None
        end_dt = None
        
        if start_date:
            try:
                start_dt = datetime.fromisoformat(start_date)
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid start_date format")
        
        if end_date:
            try:
                end_dt = datetime.fromisoformat(end_date)
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid end_date format")
        
        # Search logs
        search_user_id = None if user_role == 'admin' else user_id
        
        logs = audit_service.search_audit_logs(
            query=query,
            user_id=search_user_id,
            start_date=start_dt,
            end_date=end_dt,
            limit=limit
        )
        
        return {
            "success": True,
            "query": query,
            "logs": logs,
            "count": len(logs)
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/statistics", response_model=AuditStatsResponse)
async def get_audit_statistics(
    current_user: Dict[str, Any] = Depends(require_admin)
):
    """Get audit log statistics (admin only)"""
    try:
        stats = audit_service.get_audit_statistics()
        
        return AuditStatsResponse(
            success=True,
            statistics=stats
        )
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/export", response_model=AuditExportResponse)
async def export_audit_logs(
    format: str = Query("json", regex="^(json|csv)$"),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Export audit logs in JSON or CSV format"""
    try:
        user_id = current_user['user_id']
        user_role = current_user.get('role', 'user')
        
        # Parse dates
        start_dt = None
        end_dt = None
        
        if start_date:
            try:
                start_dt = datetime.fromisoformat(start_date)
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid start_date format")
        
        if end_date:
            try:
                end_dt = datetime.fromisoformat(end_date)
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid end_date format")
        
        # Export logs (only user's own logs unless admin)
        export_user_id = None if user_role == 'admin' else user_id
        
        result = audit_service.export_audit_logs(
            format=format,
            user_id=export_user_id,
            start_date=start_dt,
            end_date=end_dt
        )
        
        return AuditExportResponse(**result)
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/event-types")
async def get_audit_event_types():
    """Get list of available audit event types"""
    return {
        "success": True,
        "event_types": [
            {
                "value": event_type.value,
                "name": event_type.value.replace("_", " ").title()
            }
            for event_type in AuditEventType
        ]
    }