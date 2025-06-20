from pydantic import BaseModel
from typing import List
from app.schemas.user import User

class BalanceDetail(BaseModel):
    owes_user: User
    owed_to_user: User
    amount: float
    
    class Config:
        from_attributes = True

class GroupBalance(BaseModel):
    group_id: int
    balances: List[BalanceDetail]
    
class UserBalanceSummary(BaseModel):
    user: User
    total_owed: float
    total_owing: float
    net_balance: float
    
class SettlementSuggestion(BaseModel):
    from_user: User
    to_user: User
    amount: float
    description: str