"""
Card analysis endpoints for the Blackjack Card Counter API.

This module handles all card-related API endpoints.
"""
import logging
from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional

from ..models.schemas import CardInput
from ..services import card_service

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post(
    "/analyze",
    summary="Analyze cards",
    description="Analyze the current game state and get recommendations",
    response_description="Analysis results and recommendations",
)
async def analyze_cards(card_input: CardInput):
    """
    Analyze the current game state and provide recommendations.

    This endpoint takes the current game state including the player's cards,
    dealer's up card, and other parameters, and returns analysis and
    recommendations for the next move.

    - **cards**: List of cards in the game (e.g., ["A", "K", "5"])
    - **dealer_card**: Dealer's up card (e.g., "6")
    - **true_count**: Current true count (optional)
    - **decks**: Number of decks in play (default: 6.0)
    - **counting_system**: Card counting system to use (default: "hiLo")
    - **penetration**: Deck penetration (0-1, default: 0.5)

    Returns:
        dict: Analysis results and recommendations
    """
    try:
        return card_service.analyze_cards(card_input)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error in analyze_cards: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get(
    "/counting-systems",
    summary="List counting systems",
    description="Get a list of supported card counting systems",
    response_description="List of counting system names",
)
async def list_counting_systems():
    """
    Get a list of all supported card counting systems.

    Returns:
        dict: List of counting system names and their descriptions
    """
    return {
        "counting_systems": [
            {"id": "hiLo", "name": "Hi-Lo", "description": "Balanced, level 1 system"},
            {
                "id": "hiOptI",
                "name": "Hi-Opt I",
                "description": "Balanced, level 1 system",
            },
            {
                "id": "hiOptII",
                "name": "Hi-Opt II",
                "description": "Balanced, level 2 system",
            },
            {"id": "ko", "name": "KO (Knock-Out)", "description": "Unbalanced system"},
            {
                "id": "omegaII",
                "name": "Omega II",
                "description": "Balanced, level 2 system",
            },
            {
                "id": "zenCount",
                "name": "Zen Count",
                "description": "Balanced, level 2 system",
            },
        ]
    }


@router.get(
    "/hand-value",
    summary="Calculate hand value",
    description="Calculate the value of a blackjack hand",
    response_description="Hand value information",
)
async def calculate_hand_value(cards: List[str]):
    """
    Calculate the value of a blackjack hand.

    Args:
        cards (List[str]): List of card values (e.g., ["A", "K", "5"])

    Returns:
        dict: Hand value information
    """
    from ..utils.card_utils import calculate_hand_value

    try:
        value = calculate_hand_value(cards)
        return {
            "cards": cards,
            "value": value,
            "is_soft": "A" in cards and value <= 11,
            "is_blackjack": len(cards) == 2 and value == 21,
            "is_bust": value > 21,
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error in calculate_hand_value: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")
