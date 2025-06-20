from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.schemas.balance import (
    BalanceDetail, 
    UserBalanceSummary, 
    SettlementSuggestion,
    GroupBalance
)
from app.services.balance_service import BalanceService
from app.services.group_service import GroupService
from app.api.deps import get_current_user, verify_group_member
from app.models.user import User

router = APIRouter()

@router.get("/groups/{group_id}/balances", response_model=List[BalanceDetail])
def get_group_balances(
    group_id: int, 
    user_id: int = Query(..., description="User ID for authorization"),
    db: Session = Depends(get_db)
):
    """Get all balances for a specific group"""
    # Verify user is member of the group
    verify_group_member(group_id, user_id, db)
    
    balance_service = BalanceService(db)
    return balance_service.get_group_balances(group_id)

@router.get("/users/{user_id}/balances", response_model=UserBalanceSummary)
def get_user_balance_summary(
    user_id: int,
    requesting_user_id: int = Query(..., description="Requesting user ID"),
    db: Session = Depends(get_db)
):
    """Get balance summary for a user across all groups"""
    # For demo purposes, allow users to view their own balances
    # In production, add proper authorization
    if user_id != requesting_user_id:
        # Could add friend/group member check here
        pass
    
    balance_service = BalanceService(db)
    return balance_service.get_user_balance_summary(user_id)

@router.get("/groups/{group_id}/settlements", response_model=List[SettlementSuggestion])
def get_settlement_suggestions(
    group_id: int,
    user_id: int = Query(..., description="User ID for authorization"),
    db: Session = Depends(get_db)
):
    """Get optimized settlement suggestions for a group"""
    # Verify user is member of the group
    verify_group_member(group_id, user_id, db)
    
    balance_service = BalanceService(db)
    return balance_service.get_settlement_suggestions(group_id)

@router.get("/users/{user_id}/balances/detailed")
def get_user_detailed_balances(
    user_id: int,
    requesting_user_id: int = Query(..., description="Requesting user ID"),
    group_id: Optional[int] = Query(None, description="Filter by group ID"),
    db: Session = Depends(get_db)
):
    """Get detailed balance breakdown for a user"""
    # Authorization check
    if user_id != requesting_user_id:
        pass  # Add friend/member verification in production
    
    balance_service = BalanceService(db)
    
    # Get all balances where user owes money
    owes_query = db.query(balance_service.db.query(
        balance_service.db.models.balance.Balance
    ).filter(
        balance_service.db.models.balance.Balance.owes_user_id == user_id
    ))
    
    # Get all balances where user is owed money  
    owed_query = db.query(balance_service.db.query(
        balance_service.db.models.balance.Balance
    ).filter(
        balance_service.db.models.balance.Balance.owed_to_user_id == user_id
    ))
    
    if group_id:
        owes_query = owes_query.filter(
            balance_service.db.models.balance.Balance.group_id == group_id
        )
        owed_query = owed_query.filter(
            balance_service.db.models.balance.Balance.group_id == group_id
        )
    
    owes_balances = owes_query.all()
    owed_balances = owed_query.all()
    
    return {
        "user_id": user_id,
        "owes": [
            {
                "to_user": balance.owed_to_user.name,
                "to_user_id": balance.owed_to_user.id,
                "amount": balance.amount,
                "group_name": balance.group.name,
                "group_id": balance.group_id
            }
            for balance in owes_balances
        ],
        "owed": [
            {
                "from_user": balance.owes_user.name,
                "from_user_id": balance.owes_user.id,
                "amount": balance.amount,
                "group_name": balance.group.name,
                "group_id": balance.group_id
            }
            for balance in owed_balances
        ],
        "summary": balance_service.get_user_balance_summary(user_id)
    }

@router.post("/settlements/{group_id}/simulate")
def simulate_settlement(
    group_id: int,
    settlement_data: dict,
    user_id: int = Query(..., description="User ID for authorization"),
    db: Session = Depends(get_db)
):
    """Simulate what balances would look like after a settlement"""
    # Verify user is member of the group
    verify_group_member(group_id, user_id, db)
    
    from_user_id = settlement_data.get("from_user_id")
    to_user_id = settlement_data.get("to_user_id") 
    amount = settlement_data.get("amount", 0)
    
    if not from_user_id or not to_user_id or amount <= 0:
        raise HTTPException(
            status_code=400, 
            detail="Invalid settlement data. Need from_user_id, to_user_id, and positive amount"
        )
    
    balance_service = BalanceService(db)
    
    # Get current balances
    current_balances = balance_service.get_group_balances(group_id)
    
    # Simulate the settlement by temporarily updating balances
    # This is read-only simulation - doesn't actually update the database
    simulated_balances = []
    
    for balance in current_balances:
        # Copy the balance
        new_balance = BalanceDetail(
            owes_user=balance.owes_user,
            owed_to_user=balance.owed_to_user,
            amount=balance.amount
        )
        
        # Apply settlement effect
        if (balance.owes_user.id == from_user_id and 
            balance.owed_to_user.id == to_user_id):
            # Direct settlement - reduce this balance
            new_balance.amount = max(0, balance.amount - amount)
        
        # Only include non-zero balances
        if new_balance.amount > 0.01:
            simulated_balances.append(new_balance)
    
    return {
        "current_balances": current_balances,
        "simulated_balances": simulated_balances,
        "settlement": {
            "from_user_id": from_user_id,
            "to_user_id": to_user_id,
            "amount": amount
        }
    }

@router.get("/groups/{group_id}/balance-history")
def get_balance_history(
    group_id: int,
    user_id: int = Query(..., description="User ID for authorization"),
    limit: int = Query(50, description="Number of records to return"),
    db: Session = Depends(get_db)
):
    """Get balance change history for a group (requires balance audit table)"""
    # Verify user is member of the group
    verify_group_member(group_id, user_id, db)
    
    # Note: This would require a balance_history or audit table
    # For now, return a placeholder response
    return {
        "message": "Balance history tracking not implemented yet",
        "suggestion": "Add balance_history table to track balance changes over time"
    }

@router.get("/analytics/balances")
def get_balance_analytics(
    user_id: int = Query(..., description="User ID for authorization"),
    days: int = Query(30, description="Number of days to analyze"),
    db: Session = Depends(get_db)
):
    """Get balance analytics for user's groups"""
    balance_service = BalanceService(db)
    group_service = GroupService(db)
    
    # Get user's groups
    user_groups = group_service.get_user_groups(user_id)
    
    analytics = {
        "total_groups": len(user_groups),
        "groups_with_balances": 0,
        "largest_amount_owed": 0,
        "largest_amount_owing": 0,
        "most_active_group": None,
        "group_summaries": []
    }
    
    for group in user_groups:
        group_balances = balance_service.get_group_balances(group.id)
        user_balance = balance_service.get_user_balance_summary(user_id)
        
        if group_balances:
            analytics["groups_with_balances"] += 1
        
        # Find user's involvement in this group's balances
        user_owes_in_group = sum(
            balance.amount for balance in group_balances 
            if balance.owes_user.id == user_id
        )
        user_owed_in_group = sum(
            balance.amount for balance in group_balances 
            if balance.owed_to_user.id == user_id
        )
        
        analytics["largest_amount_owed"] = max(
            analytics["largest_amount_owed"], user_owed_in_group
        )
        analytics["largest_amount_owing"] = max(
            analytics["largest_amount_owing"], user_owes_in_group
        )
        
        analytics["group_summaries"].append({
            "group_id": group.id,
            "group_name": group.name,
            "user_owes": user_owes_in_group,
            "user_owed": user_owed_in_group,
            "total_balances": len(group_balances),
            "net_balance": user_owed_in_group - user_owes_in_group
        })
    
    # Find most active group (most balances)
    if analytics["group_summaries"]:
        most_active = max(
            analytics["group_summaries"], 
            key=lambda x: x["total_balances"]
        )
        analytics["most_active_group"] = {
            "name": most_active["group_name"],
            "id": most_active["group_id"],
            "balance_count": most_active["total_balances"]
        }
    
    return analytics