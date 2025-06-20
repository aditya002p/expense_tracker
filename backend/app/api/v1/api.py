from fastapi import APIRouter
from app.api.v1.endpoints import users, groups, expenses, balances

api_router = APIRouter()
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(groups.router, prefix="/groups", tags=["groups"])
api_router.include_router(expenses.router, prefix="/groups", tags=["expenses"])
api_router.include_router(balances.router, prefix="/balances", tags=["balances"])  # NEW