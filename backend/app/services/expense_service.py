from sqlalchemy.orm import Session
from typing import List
from app.models.expense import Expense, ExpenseSplit
from app.models.group import Group, GroupMember
from app.schemas.expense import ExpenseCreate
from app.services.balance_service import BalanceService
from app.utils.split_calculator import SplitCalculator
from app.core.exceptions import GroupNotFound, UserNotFound, InvalidSplitException

class ExpenseService:
    def __init__(self, db: Session):
        self.db = db
        self.balance_service = BalanceService(db)
    
    def create_expense(self, group_id: int, expense_data: ExpenseCreate) -> Expense:
        # Verify group exists
        group = self.db.query(Group).filter(Group.id == group_id).first()
        if not group:
            raise GroupNotFound(group_id)
        
        # Get group member IDs
        member_ids = [
            member.user_id for member in 
            self.db.query(GroupMember).filter(GroupMember.group_id == group_id).all()
        ]
        
        # Verify payer is in group
        if expense_data.paid_by_user_id not in member_ids:
            raise InvalidSplitException("Payer must be a member of the group")
        
        # Calculate splits
        split_amounts = SplitCalculator.calculate_splits(
            expense_data.amount,
            expense_data.split_type,
            expense_data.splits,
            member_ids
        )
        
        # Verify split total matches expense amount (for exact splits)
        if expense_data.split_type.value == "exact":
            total_split = sum(split_amounts.values())
            if abs(total_split - expense_data.amount) > 0.01:
                raise InvalidSplitException(
                    f"Split total ({total_split}) doesn't match expense amount ({expense_data.amount})"
                )
        
        # Create expense
        db_expense = Expense(
            group_id=group_id,
            paid_by_user_id=expense_data.paid_by_user_id,
            description=expense_data.description,
            amount=expense_data.amount,
            split_type=expense_data.split_type
        )
        self.db.add(db_expense)
        self.db.flush()
        
        # Create splits
        for user_id, amount in split_amounts.items():
            if amount > 0:  # Only create splits for non-zero amounts
                split = ExpenseSplit(
                    expense_id=db_expense.id,
                    user_id=user_id,
                    amount=amount,
                    percentage=next(
                        (s.percentage for s in expense_data.splits if s.user_id == user_id),
                        None
                    )
                )
                self.db.add(split)
        
        self.db.commit()
        
        # Update balances
        self.balance_service.update_balances_for_expense(db_expense.id)
        
        self.db.refresh(db_expense)
        return db_expense
    
    def get_group_expenses(self, group_id: int) -> List[Expense]:
        return (
            self.db.query(Expense)
            .filter(Expense.group_id == group_id)
            .order_by(Expense.created_at.desc())
            .all()
        )
    
    def get_user_expenses(self, user_id: int) -> List[Expense]:
        return (
            self.db.query(Expense)
            .filter(Expense.paid_by_user_id == user_id)
            .order_by(Expense.created_at.desc())
            .all()
        )
    
    def delete_expense(self, expense_id: int) -> bool:
        expense = self.db.query(Expense).filter(Expense.id == expense_id).first()
        if not expense:
            return False
        
        # Delete associated balances first
        self.balance_service.remove_balances_for_expense(expense_id)
        
        # Delete expense (splits will be cascade deleted)
        self.db.delete(expense)
        self.db.commit()
        
        return True