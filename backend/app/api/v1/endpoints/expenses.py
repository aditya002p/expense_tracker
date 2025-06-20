from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.schemas.expense import Expense as ExpenseSchema, ExpenseCreate
from app.services.expense_service import ExpenseService

router = APIRouter()

@router.post("/{group_id}/expenses", response_model=ExpenseSchema)
def create_expense(group_id: int, expense: ExpenseCreate, db: Session = Depends(get_db)):
    expense_service = ExpenseService(db)
    return expense_service.create_expense(group_id, expense)

@router.get("/{group_id}/expenses", response_model=List[ExpenseSchema])
def get_group_expenses(group_id: int, db: Session = Depends(get_db)):
    expense_service = ExpenseService(db)
    return expense_service.get_group_expenses(group_id)

@router.delete("/expenses/{expense_id}")
def delete_expense(expense_id: int, db: Session = Depends(get_db)):
    expense_service = ExpenseService(db)
    success = expense_service.delete_expense(expense_id)
    if not success:
        raise HTTPException(status_code=404, detail="Expense not found")
    return {"success": True}