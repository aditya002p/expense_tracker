from fastapi import HTTPException, status

class SplitwiseException(HTTPException):
    def __init__(self, detail: str):
        super().__init__(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)

class GroupNotFound(HTTPException):
    def __init__(self, group_id: int):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Group with id {group_id} not found"
        )

class UserNotFound(HTTPException):
    def __init__(self, user_id: int):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id {user_id} not found"
        )

class InvalidSplitException(SplitwiseException):
    def __init__(self, message: str):
        super().__init__(f"Invalid split configuration: {message}")

class InsufficientBalanceException(SplitwiseException):
    def __init__(self, user_id: int, required: float, available: float):
        super().__init__(
            f"User {user_id} has insufficient balance. Required: {required}, Available: {available}"
        )