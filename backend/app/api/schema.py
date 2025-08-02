from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.user import User
from app.services.auth import get_current_user
from app.services.schema import propose_schema_change, approve_schema_change, get_schema_proposals

router = APIRouter()

@router.post("/propose")
async def propose_schema_modification(
    proposal_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # TODO: Implement schema change proposal
    proposal = propose_schema_change(db, proposal_data, current_user.id)
    return proposal

@router.get("/proposals")
async def list_schema_proposals(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # TODO: Implement proposal listing
    proposals = get_schema_proposals(db, current_user.id)
    return proposals

@router.post("/proposals/{proposal_id}/approve")
async def approve_proposal(
    proposal_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # TODO: Implement proposal approval (admin only)
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    result = approve_schema_change(db, proposal_id, current_user.id)
    return result

@router.post("/proposals/{proposal_id}/reject")
async def reject_proposal(
    proposal_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # TODO: Implement proposal rejection (admin only)
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    return {"message": "Proposal rejected", "proposal_id": proposal_id}