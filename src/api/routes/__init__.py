"""
API routes for the Blackjack Card Counter application.

This module imports and includes all route modules.
"""
from fastapi import APIRouter
from . import cards, strategy, bankroll, root

# Create main router
router = APIRouter()

# Include all route modules
router.include_router(root.router, tags=["root"])
router.include_router(cards.router, prefix="/api/cards", tags=["cards"])
router.include_router(strategy.router, prefix="/api/strategy", tags=["strategy"])
router.include_router(bankroll.router, prefix="/api/bankroll", tags=["bankroll"])
