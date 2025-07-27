"""
Strategy endpoints for the Blackjack Card Counter API.

This module handles all strategy-related API endpoints.
"""
import logging
from fastapi import APIRouter, HTTPException
from typing import List, Dict, Optional

from ..models.schemas import StrategyRequest
from ..services import strategy_service

# Configure logging
logger = logging.getLogger(__name__)

router = APIRouter()

@router.post(
    "/recommend",
    summary="Get strategy recommendation",
    description="Get a strategy recommendation for the current hand",
    response_description="Strategy recommendation"
)
async def get_strategy_recommendation(strategy_request: StrategyRequest):
    """
    Get a strategy recommendation for the current hand.
    
    This endpoint analyzes the current hand and provides a recommended
    action (e.g., hit, stand, double down, split, surrender) along with
    alternative actions and their confidence levels.
    
    - **player_hand**: List of the player's cards (e.g., ["A", "K"])
    - **dealer_card**: Dealer's up card (e.g., "6")
    - **true_count**: Current true count (default: 0.0)
    - **decks_remaining**: Number of decks remaining (default: 6.0)
    - **counting_system**: Card counting system to use (default: "hiLo")
    
    Returns:
        dict: Strategy recommendation and alternatives
    """
    try:
        # Await the async function
        return await strategy_service.get_strategy_recommendation(strategy_request)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error in get_strategy_recommendation: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get(
    "/basic-strategy",
    summary="Get basic strategy",
    description="Get the basic strategy for a given set of rules",
    response_description="Basic strategy table"
)
async def get_basic_strategy(
    decks: int = 6,
    dealer_hits_soft_17: bool = True,
    double_after_split: bool = True,
    late_surrender: bool = False,
    double_any: bool = True
):
    """
    Get the basic strategy for the specified rules.
    
    Args:
        decks: Number of decks (1, 2, 4, 6, or 8)
        dealer_hits_soft_17: Whether the dealer hits on soft 17
        double_after_split: Whether doubling after split is allowed
        late_surrender: Whether late surrender is allowed
        double_any: Whether doubling is allowed on any two cards
        
    Returns:
        dict: Basic strategy table
    """
    # This is a simplified implementation. In a real application,
    # this would load the appropriate strategy table based on the rules.
    try:
        # Validate input
        if decks not in [1, 2, 4, 6, 8]:
            raise ValueError("Number of decks must be 1, 2, 4, 6, or 8")
            
        # In a real implementation, this would load the strategy table
        # from a file or database based on the rules
        return {
            "rules": {
                "decks": decks,
                "dealer_hits_soft_17": dealer_hits_soft_17,
                "double_after_split": double_after_split,
                "late_surrender": late_surrender,
                "double_any": double_any
            },
            "strategy": "Basic strategy table would be returned here based on rules"
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error in get_basic_strategy: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")
