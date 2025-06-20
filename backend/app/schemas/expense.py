from pydantic import BaseModel, validator
from datetime import datetime
from typing import List, Dict, Optional
from app.models.expense import SplitType
from app.schemas.user import User

class ExpenseSplitCreate(BaseModel):
    user_id: int
    amount: Optional[float] = None
    percentage: Optional[float] = None

class ExpenseCreate(BaseModel):
    description: str
    amount: float
    paid_by_user_id: int
    split_type: SplitType
    splits: List[ExpenseSplitCreate]
    
    @validator('amount')
    def amount_must_be_positive(cls, v):
        if v <= 0:
            raise ValueError('Amount must be positive')
        return v
    
    @validator('splits')
    def validate_splits(cls, v, values):
        if not v:
            raise ValueError('At least one split is required')
        
        split_type = values.get('split_type')
        if split_type == SplitType.PERCENTAGE:
            total_percentage = sum(split.percentage or 0 for split in v)
            if abs(total_percentage - 100) > 0.01:
                raise ValueError('Percentage splits must sum to 100%')
        
        return v

class ExpenseSplit(BaseModel):
    id: int
    user: User
    amount: float
    percentage: Optional[float] = None
    
    class Config:
        from_attributes = True

class Expense(BaseModel):
    id: int
    description: str
    amount: float
    split_type: SplitType
    paid_by_user: User
    splits: List[ExpenseSplit]
    created_at: datetime
    
    class Config:
        from_attributes = True