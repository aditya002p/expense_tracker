from typing import List, Dict
from app.models.expense import SplitType
from app.schemas.expense import ExpenseSplitCreate
from app.core.exceptions import InvalidSplitException

class SplitCalculator:
    @staticmethod
    def calculate_splits(
        amount: float,
        split_type: SplitType,
        splits: List[ExpenseSplitCreate],
        group_member_ids: List[int]
    ) -> Dict[int, float]:
        """Calculate the actual amounts each user owes based on split configuration"""
        
        if split_type == SplitType.EQUAL:
            return SplitCalculator._calculate_equal_split(amount, group_member_ids)
        elif split_type == SplitType.PERCENTAGE:
            return SplitCalculator._calculate_percentage_split(amount, splits)
        elif split_type == SplitType.EXACT:
            return SplitCalculator._calculate_exact_split(splits)
        else:
            raise InvalidSplitException(f"Unsupported split type: {split_type}")
    
    @staticmethod
    def _calculate_equal_split(amount: float, member_ids: List[int]) -> Dict[int, float]:
        if not member_ids:
            raise InvalidSplitException("No group members to split between")
        
        per_person = round(amount / len(member_ids), 2)
        remainder = round(amount - (per_person * len(member_ids)), 2)
        
        result = {member_id: per_person for member_id in member_ids}
        
        # Add remainder to first person to handle rounding
        if remainder != 0:
            result[member_ids[0]] += remainder
            
        return result
    
    @staticmethod
    def _calculate_percentage_split(amount: float, splits: List[ExpenseSplitCreate]) -> Dict[int, float]:
        total_percentage = sum(split.percentage or 0 for split in splits)
        
        if abs(total_percentage - 100) > 0.01:
            raise InvalidSplitException("Percentage splits must sum to 100%")
        
        result = {}
        calculated_total = 0
        
        for i, split in enumerate(splits):
            if split.percentage is None:
                raise InvalidSplitException("Percentage must be specified for percentage splits")
            
            if i == len(splits) - 1:  # Last split gets remainder to handle rounding
                result[split.user_id] = round(amount - calculated_total, 2)
            else:
                split_amount = round(amount * (split.percentage / 100), 2)
                result[split.user_id] = split_amount
                calculated_total += split_amount
        
        return result
    
    @staticmethod
    def _calculate_exact_split(splits: List[ExpenseSplitCreate]) -> Dict[int, float]:
        result = {}
        total = 0
        
        for split in splits:
            if split.amount is None:
                raise InvalidSplitException("Amount must be specified for exact splits")
            if split.amount < 0:
                raise InvalidSplitException("Split amounts cannot be negative")
            
            result[split.user_id] = split.amount
            total += split.amount
        
        return result