from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.schemas.group import Group as GroupSchema, GroupCreate, GroupUpdate
from app.services.group_service import GroupService
from app.services.balance_service import BalanceService
from app.services.llm_service import LLMService

router = APIRouter()

@router.post("/", response_model=GroupSchema)
def create_group(group: GroupCreate, db: Session = Depends(get_db)):
    group_service = GroupService(db)
    return group_service.create_group(group)

@router.get("/{group_id}", response_model=GroupSchema)
def get_group(group_id: int, db: Session = Depends(get_db)):
    group_service = GroupService(db)
    return group_service.get_group(group_id)

@router.put("/{group_id}", response_model=GroupSchema)
def update_group(group_id: int, group_update: GroupUpdate, db: Session = Depends(get_db)):
    group_service = GroupService(db)
    return group_service.update_group(group_id, group_update)

@router.delete("/{group_id}")
def delete_group(group_id: int, db: Session = Depends(get_db)):
    group_service = GroupService(db)
    return {"success": group_service.delete_group(group_id)}

@router.post("/{group_id}/members/{user_id}")
def add_member(group_id: int, user_id: int, db: Session = Depends(get_db)):
    group_service = GroupService(db)
    return group_service.add_member(group_id, user_id)

@router.get("/{group_id}/balances")
def get_group_balances(group_id: int, db: Session = Depends(get_db)):
    balance_service = BalanceService(db)
    return balance_service.get_group_balances(group_id)

@router.get("/{group_id}/settlement-suggestions")
def get_settlement_suggestions(group_id: int, db: Session = Depends(get_db)):
    balance_service = BalanceService(db)
    return balance_service.get_settlement_suggestions(group_id)

@router.get("/{group_id}/insights")
def get_group_insights(group_id: int, db: Session = Depends(get_db)):
    llm_service = LLMService(db)
    return llm_service.get_expense_insights(group_id)