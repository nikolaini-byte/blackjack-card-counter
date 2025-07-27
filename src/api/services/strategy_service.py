"""
Strategy service for the Blackjack Card Counter API.

This module contains the logic for determining the optimal strategy in Blackjack,
including basic strategy, card counting integration, and advanced strategy adjustments
based on the current game state and count.
"""
from typing import List, Dict, Optional, Literal, TypedDict, Tuple
from enum import Enum, auto
from functools import lru_cache
import hashlib
import json

from fastapi_cache.decorator import cache

from ..models.schemas import StrategyRequest
from ..utils import card_utils, counting_systems
import logging

# Configure logging
logger = logging.getLogger(__name__)

# Type aliases for better type hints
ActionType = Literal["HIT", "STAND", "DOUBLE", "SPLIT", "SURRENDER"]
ConfidenceType = float  # Value between 0.0 and 1.0
CardValue = str  # e.g., 'A', '2', '10', 'K'

class StrategyRecommendation(TypedDict):
    """Type definition for strategy recommendation response."""
    action: ActionType
    confidence: ConfidenceType
    alternatives: List[ActionType]

def _generate_cache_key(strategy_request: StrategyRequest) -> str:
    """
    Generate a unique cache key for the strategy request.
    
    Args:
        strategy_request: The strategy request to generate a key for
        
    Returns:
        str: A unique cache key
    """
    # Create a unique string representation of the request
    key_parts = [
        ":".join(sorted(strategy_request.player_hand)),
        strategy_request.dealer_card,
        f"{strategy_request.true_count:.1f}",
        f"{strategy_request.decks_remaining:.1f}",
        strategy_request.counting_system
    ]
    key_str = "|".join(key_parts).encode('utf-8')
    
    # Use SHA-256 to create a fixed-length hash of the key
    return hashlib.sha256(key_str).hexdigest()

@cache(expire=3600)  # Cache results for 1 hour
async def get_strategy_recommendation(strategy_request: StrategyRequest) -> StrategyRecommendation | Dict[str, str]:
    """
    Get the optimal strategy recommendation based on the current game state.
    
    This function analyzes the current game state including the player's hand, dealer's up card,
    and current true count to determine the optimal playing strategy according to basic strategy
    and card counting principles.
    
    The results are cached to improve performance for identical requests.
    
    Args:
        strategy_request: A StrategyRequest object containing:
            - player_hand: List of cards in the player's hand (e.g., ["A", "K"])
            - dealer_card: Dealer's face-up card (e.g., "6")
            - true_count: Current true count (default: 0.0)
            - decks_remaining: Number of decks remaining in the shoe (default: 6.0)
            - counting_system: Name of the counting system to use (default: "hiLo")
    
    Returns:
        StrategyRecommendation: A dictionary containing:
            - action: Recommended action (HIT, STAND, DOUBLE, SPLIT, or SURRENDER)
            - confidence: Confidence level of the recommendation (0.0 to 1.0)
            - alternatives: List of alternative actions in order of preference
    """
    # Generate a cache key for this request
    cache_key = _generate_cache_key(strategy_request)
    logger.debug(f"Cache key for request: {cache_key}")
    
    try:
        # Validate input
        if not strategy_request.player_hand:
            raise ValueError("Player hand cannot be empty")
            
        if not strategy_request.dealer_card:
            raise ValueError("Dealer card is required")
        
        # Calculate hand values
        player_hand_value = card_utils.calculate_hand_value(strategy_request.player_hand)
        dealer_card_value = card_utils.calculate_hand_value([strategy_request.dealer_card])
        
        # Check for pairs (only if exactly 2 cards)
        is_pair = (len(strategy_request.player_hand) == 2 and 
                  strategy_request.player_hand[0] == strategy_request.player_hand[1])
        
        # Get the strategy recommendation
        action = _determine_action(
            player_hand_value=player_hand_value,
            dealer_card_value=dealer_card_value,
            true_count=strategy_request.true_count,
            player_hand=strategy_request.player_hand,
            is_initial_hand=len(strategy_request.player_hand) == 2,
            is_pair=is_pair
        )
        
        # Calculate confidence based on true count and other factors
        confidence = _calculate_confidence(
            true_count=strategy_request.true_count,
            action=action,
            player_hand_value=player_hand_value,
            dealer_card_value=dealer_card_value,
            is_pair=is_pair
        )
        
        # Generate alternative actions
        alternatives = _generate_alternatives(
            action=action,
            confidence=confidence,
            player_hand_value=player_hand_value,
            dealer_card_value=dealer_card_value
        )
        
        # Return the recommendation with proper typing
        return {
            "action": action,
            "confidence": confidence,
            "alternatives": alternatives
        }
        
    except ValueError as ve:
        logger.warning(f"Validation error in strategy recommendation: {ve}")
        return {"error": f"Invalid input: {ve}"}
        
    except Exception as e:
        logger.error(f"Unexpected error in get_strategy_recommendation: {e}", 
                   exc_info=True)
        return {"error": "An unexpected error occurred while generating strategy"}

def _determine_action(
    player_hand_value: int,
    dealer_card_value: int,
    true_count: float,
    player_hand: List[CardValue],
    is_initial_hand: bool = False,
    is_pair: bool = False
) -> ActionType:
    """
    Determine the optimal action based on the current game state.
    
    This internal function implements the core strategy logic, taking into account:
    - Basic strategy (player hand value vs dealer up card)
    - Soft hands (hands containing an Ace counted as 11)
    - Pairs (when the player can split)
    - True count adjustments (for card counting strategies)
    
    Args:
        player_hand_value: Total value of the player's hand
        dealer_card_value: Value of the dealer's up card (2-11)
        true_count: Current true count (positive favors player, negative favors dealer)
        player_hand: List of cards in the player's hand (e.g., ["A", "8"])
        is_initial_hand: Whether this is the initial two-card hand
        is_pair: Whether the hand is a pair (only relevant for initial hand)
        
    Returns:
        ActionType: The recommended action (HIT, STAND, DOUBLE, SPLIT, or SURRENDER)
        
    Note:
        This function assumes all input validation has been done by the caller.
    """
    """
    Determine the best action based on the game state.
    
    This is a simplified implementation. A real implementation would use
    a more sophisticated strategy matrix.
    """
    # Check for blackjack
    if player_hand_value == 21 and is_initial_hand:
        return "STAND"
    
    # Check for pairs (splitting)
    if is_pair and is_initial_hand:
        pair_value = player_hand_value // 2
        if pair_value in [8, 11]:
            return "SPLIT"
        elif pair_value == 7 and dealer_card_value < 8:
            return "SPLIT"
    
    # Check for soft hands (Ace + other card)
    if player_hand_value > 11 and any(card == "A" for card in player_hand):
        if player_hand_value < 18:
            return "HIT"
        elif player_hand_value == 18 and dealer_card_value >= 9:
            return "HIT"
        else:
            return "STAND"
    
    # Basic strategy decisions
    if player_hand_value < 12:
        return "HIT"
    elif player_hand_value > 16:
        return "STAND"
    elif true_count >= 2:
        # More aggressive with high true count
        if player_hand_value < 18:
            return "HIT"
        else:
            return "STAND"
    else:
        # Conservative with low/negative true count
        if player_hand_value < 15 and dealer_card_value >= 7:
            return "HIT"
        else:
            return "STAND"

def _calculate_confidence(
    true_count: float,
    action: ActionType,
    player_hand_value: int,
    dealer_card_value: int,
    is_pair: bool = False
) -> ConfidenceType:
    """
    Calculate the confidence level of a strategy recommendation.
    
    This function determines how confident we are in the recommended action based on:
    - The absolute value of the true count (higher absolute values increase confidence)
    - The player's hand value (more extreme values are more certain)
    - The dealer's up card (some up cards make decisions more clear-cut)
    - Whether the hand is a pair (pair decisions are often more certain)
    
    Args:
        true_count: Current true count (positive favors player, negative favors dealer)
        action: Recommended action (HIT, STAND, etc.)
        player_hand_value: Total value of the player's hand (2-21)
        dealer_card_value: Value of the dealer's up card (2-11)
        is_pair: Whether the hand is a pair (default: False)
        
    Returns:
        ConfidenceType: A value between 0.0 (no confidence) and 1.0 (absolute certainty)
        representing our confidence in the recommended action.
        
    Note:
        - For HIT/STAND decisions, confidence is higher with more extreme hand values
        - For SPLIT/DOUBLE decisions, confidence is generally higher
        - Higher absolute true counts increase confidence in count-based decisions
    """
    # Start with a base confidence
    base_confidence: float = 0.8
    
    # Adjust confidence based on the action type
    if action in ["SPLIT", "DOUBLE", "SURRENDER"]:
        # These are typically more clear-cut decisions
        base_confidence = 0.9
    
    # Adjust for player hand value
    if player_hand_value <= 12 or player_hand_value >= 19:
        # More confident in extreme hand values
        base_confidence = min(1.0, base_confidence + 0.1)
    elif player_hand_value in [13, 14, 15, 16]:
        # Less confident in the "stiff" hands (13-16)
        base_confidence = max(0.6, base_confidence - 0.1)
    
    # Adjust for true count
    # Higher absolute true counts increase confidence in count-based decisions
    abs_true_count = abs(true_count)
    if abs_true_count > 3.0:
        base_confidence = min(1.0, base_confidence + 0.15)
    elif abs_true_count > 1.5:
        base_confidence = min(1.0, base_confidence + 0.1)
    
    # Adjust for dealer's up card
    # Some dealer up cards make decisions more clear-cut
    if dealer_card_value in [2, 7, 8, 9, 10, 11]:  # Ace is 11
        base_confidence = min(1.0, base_confidence + 0.05)
    
    # Ensure confidence is within bounds
    return max(0.5, min(1.0, base_confidence))

def _generate_alternatives(
    action: ActionType,
    confidence: ConfidenceType,
    player_hand_value: int,
    dealer_card_value: int
) -> List[Dict[str, str | float]]:
    """
    Generate a list of alternative actions with adjusted confidence levels.
    
    This function provides alternative actions to the primary recommendation,
    which can be useful when the primary action's confidence is not absolute.
    The alternatives are ordered by their relative strength.
    
    Args:
        action: The primary recommended action
        confidence: Confidence level of the primary action (0.0 to 1.0)
        player_hand_value: Total value of the player's hand (2-21)
        dealer_card_value: Value of the dealer's up card (2-11)
        
    Returns:
        List[Dict[str, str | float]]: A list of alternative actions, where each
        alternative is a dictionary with:
            - action: The alternative action (HIT, STAND, etc.)
            - confidence: The relative confidence in this alternative (0.0 to 1.0)
            
    Note:
        - The sum of confidences across all alternatives will be (1.0 - primary_confidence)
        - Alternatives are ordered from most to least preferred
    """
    alternatives: List[Dict[str, str | float]] = []
    remaining_confidence = 1.0 - confidence
    
    # Define possible actions based on the primary action
    if action == "HIT":
        # For HIT, the main alternative is STAND
        alternatives.append({
            "action": "STAND",
            "confidence": remaining_confidence * 0.8
        })
        # Add DOUBLE as a secondary alternative if it's the first two cards
        if player_hand_value in [9, 10, 11] and remaining_confidence > 0.1:
            alternatives.append({
                "action": "DOUBLE",
                "confidence": remaining_confidence * 0.2
            })
            
    elif action == "STAND":
        # For STAND, the main alternative is HIT
        alternatives.append({
            "action": "HIT",
            "confidence": remaining_confidence * 0.8
        })
        # Add SURRENDER as an alternative in certain situations
        if player_hand_value in [15, 16] and dealer_card_value in [9, 10, 11]:
            alternatives.append({
                "action": "SURRENDER",
                "confidence": remaining_confidence * 0.2
            })
    
    elif action == "DOUBLE":
        # For DOUBLE, alternatives are HIT and STAND
        alternatives.extend([
            {"action": "HIT", "confidence": remaining_confidence * 0.6},
            {"action": "STAND", "confidence": remaining_confidence * 0.4}
        ])
    
    elif action == "SPLIT":
        # For SPLIT, alternatives are HIT and STAND
        alternatives.extend([
            {"action": "HIT", "confidence": remaining_confidence * 0.5},
            {"action": "STAND", "confidence": remaining_confidence * 0.5}
        ])
    
    elif action == "SURRENDER":
        # For SURRENDER, alternatives are STAND and HIT
        alternatives.extend([
            {"action": "STAND", "confidence": remaining_confidence * 0.6},
            {"action": "HIT", "confidence": remaining_confidence * 0.4}
        ])
    
    # Ensure we don't have negative confidence
    alternatives = [
        {**alt, "confidence": max(0.0, min(1.0, float(alt["confidence"])))}
        for alt in alternatives
    ]
    
    # Sort alternatives by confidence (highest first)
    return sorted(alternatives, key=lambda x: -x["confidence"])
