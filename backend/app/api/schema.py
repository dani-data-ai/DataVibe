from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
from app.services.schema_service import schema_service
from app.api.sessions import get_user_session
from app.middleware.auth import get_current_user, require_admin

router = APIRouter()

class SchemaProposalRequest(BaseModel):
    natural_language: str
    session_id: str
    environment: str = "development"  # development or production

class SchemaProposalResponse(BaseModel):
    success: bool
    proposal_id: str = None
    migration_sql: str = None
    explanation: str = None
    warnings: List[str] = []
    environment: str = None
    status: str = None
    requires_approval: bool = False
    message: str = None

@router.post("/propose", response_model=SchemaProposalResponse)
async def propose_schema_modification(
    request: SchemaProposalRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Propose a schema change using natural language"""
    try:
        user_id = current_user['user_id']
        
        # Get connection string for the session
        connection_string = get_user_session(request.session_id, current_user)
        
        # Create schema proposal
        result = await schema_service.propose_schema_change(
            user_id=user_id,
            session_id=request.session_id,
            natural_language=request.natural_language,
            connection_string=connection_string,
            environment=request.environment
        )
        
        return SchemaProposalResponse(**result)
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/proposals")
async def list_schema_proposals(
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """List schema proposals for current user or all if admin"""
    user_id = current_user['user_id']
    user_role = current_user.get('role', 'user')
    
    if user_role == 'admin':
        proposals = schema_service.get_all_proposals()
    else:
        proposals = schema_service.get_user_proposals(user_id)
    
    return {
        "success": True,
        "proposals": proposals,
        "count": len(proposals)
    }

class ApprovalRequest(BaseModel):
    execute_immediately: bool = False
    session_id: str = None

@router.post("/proposals/{proposal_id}/approve")
async def approve_proposal(
    proposal_id: str,
    request: ApprovalRequest,
    current_user: Dict[str, Any] = Depends(require_admin)
):
    """Approve a schema proposal (admin only)"""
    try:
        admin_user_id = current_user['user_id']
        connection_string = None
        
        # If immediate execution requested, get connection string
        if request.execute_immediately and request.session_id:
            connection_string = get_user_session(request.session_id, current_user)
        
        result = await schema_service.approve_proposal(
            proposal_id=proposal_id,
            admin_user_id=admin_user_id,
            connection_string=connection_string
        )
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

class RejectionRequest(BaseModel):
    reason: str = ""

@router.post("/proposals/{proposal_id}/reject")
async def reject_proposal(
    proposal_id: str,
    request: RejectionRequest,
    current_user: Dict[str, Any] = Depends(require_admin)
):
    """Reject a schema proposal (admin only)"""
    try:
        admin_user_id = current_user['user_id']
        
        result = schema_service.reject_proposal(
            proposal_id=proposal_id,
            admin_user_id=admin_user_id,
            reason=request.reason
        )
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/proposals/{proposal_id}")
async def get_proposal(
    proposal_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get a specific schema proposal"""
    proposal = schema_service.get_proposal(proposal_id)
    
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")
    
    # Check permissions - users can only see their own proposals, admins can see all
    user_role = current_user.get('role', 'user')
    if user_role != 'admin' and proposal['user_id'] != current_user['user_id']:
        raise HTTPException(status_code=403, detail="Not authorized to view this proposal")
    
    return {
        "success": True,
        "proposal": proposal
    }