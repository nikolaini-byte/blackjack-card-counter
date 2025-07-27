"""
Card analysis service for the Blackjack Card Counter API.

This module contains the core business logic for card analysis, including:
- Card counting calculations
- Hand value analysis
- Probability calculations
- Play recommendations based on game state and card counting
"""
from typing import Dict, List, Tuple, Optional, TypedDict, Literal, Union
from typing_extensions import NotRequired  # For Python < 3.11
from ..models.schemas import CardInput
from ..utils import card_utils, counting_systems

# Type aliases for better type hints
ActionType = Literal["HIT", "STAND", "DOUBLE", "SPLIT", "SURRENDER"]
ConfidenceType = float  # Value between 0.0 and 1.0
CardValue = str  # e.g., 'A', '2', '10', 'K'

class CountingAnalysis(TypedDict):
    """Type definition for counting analysis results."""
    running_count: int
    true_count: float
    cards_remaining: int
    deck_penetration: float
    recommendation: ActionType

class Statistics(TypedDict):
    """Type definition for statistical analysis results."""
    player_hand_value: int
    bust_probability: float
    win_probability: float
    push_probability: float
    lose_probability: float

class AlternativeAction(TypedDict):
    """Type definition for alternative action recommendations."""
    action: ActionType
    confidence: ConfidenceType

class Recommendation(TypedDict):
    """Type definition for the recommendation section of the response."""
    action: ActionType
    confidence: ConfidenceType
    alternatives: List[AlternativeAction]

class CardAnalysisResponse(TypedDict):
    """Type definition for the complete card analysis response."""
    counting_analysis: CountingAnalysis
    statistics: Statistics
    recommendations: Recommendation

def analyze_cards(card_input: CardInput) -> Union[CardAnalysisResponse, Dict[str, str]]:
    """
    Analyze the current game state and provide comprehensive recommendations.
    
    This function is the main entry point for card analysis. It takes the current
    game state (player's cards, dealer's up card, etc.) and returns a detailed
    analysis including counting information, statistics, and recommendations.
    
    Args:
        card_input: A CardInput object containing:
            - cards: List of cards in the player's hand (e.g., ["A", "8"])
            - dealer_card: Dealer's face-up card (e.g., "6")
            - decks: Total number of decks in the shoe
            - penetration: Fraction of the shoe that has been played (0.0 to 1.0)
            - counting_system: Name of the counting system to use (default: "hiLo")
            - true_count: Optional pre-calculated true count (if None, it will be calculated)
            
    Returns:
        CardAnalysisResponse: A dictionary containing:
            - counting_analysis: Running count, true count, and deck information
            - statistics: Probabilities for different game outcomes
            - recommendations: Suggested actions with confidence levels
            
        If an error occurs, returns a dictionary with an "error" key and error message.
        
    Example:
        >>> card_input = CardInput(
        ...     cards=["A", "8"],
        ...     dealer_card="6",
        ...     decks=6,
        ...     penetration=0.5,
        ...     counting_system="hiLo"
        ... )
        >>> analysis = analyze_cards(card_input)
        >>> print(analysis["recommendations"]["action"])
        'STAND'
    """
    # Calculate running and true counts
    running_count = counting_systems.calculate_running_count(
        card_input.cards, 
        card_input.counting_system
    )
    
    # Calculate true count (using the provided true count or calculating it)
    if card_input.true_count is None:
        decks_remaining = card_input.decks * (1 - card_input.penetration)
        true_count = counting_systems.calculate_true_count(
            running_count, 
            decks_remaining,
            card_input.counting_system
        )
    else:
        true_count = card_input.true_count
    
    # Calculate hand values and probabilities
    player_hand_value = card_utils.calculate_hand_value(card_input.cards)
    probabilities = card_utils.calculate_advanced_probabilities(
        card_input.cards,
        card_input.dealer_card,
        card_input.cards + [card_input.dealer_card],
        card_input.decks
    )
    
    # Generate recommendations
    recommendation = _get_play_recommendation(
        player_hand_value,
        card_input.dealer_card,
        true_count
    )
    
    # Prepare response
    return {
        "counting_analysis": {
            "running_count": running_count,
            "true_count": round(true_count, 2),
            "cards_remaining": int(card_input.decks * 52 * (1 - card_input.penetration)),
            "deck_penetration": card_input.penetration,
            "recommendation": recommendation
        },
        "statistics": {
            "player_hand_value": player_hand_value,
            "bust_probability": probabilities["bust"],
            "win_probability": probabilities["win"],
            "push_probability": probabilities["push"],
            "lose_probability": probabilities["lose"]
        },
        "recommendations": {
            "action": recommendation,
            "confidence": 0.8,  # Placeholder confidence value
            "alternatives": [
                {"action": _get_alternative_action(recommendation), "confidence": 0.2}
            ]
        }
    }

def _get_play_recommendation(
    player_hand_value: int, 
    dealer_card: str, 
    true_count: float
) -> ActionType:
    """
    Determine the optimal play based on the current game state.
    
    This function implements a simplified basic strategy that considers:
    - Player's hand value
    - Dealer's up card
    - Current true count
    
    Args:
        player_hand_value: Total value of the player's hand (2-21)
        dealer_card: Dealer's face-up card (e.g., "6", "A")
        true_count: Current true count (positive favors player, negative favors dealer)
        
    Returns:
        ActionType: The recommended action (HIT, STAND, etc.)
        
    Note:
        This is a simplified implementation. A production system would use
        a more sophisticated strategy matrix that considers all possible
        hand combinations and game rules.
    """
    dealer_value = card_utils.calculate_hand_value([dealer_card])
    
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
        if player_hand_value < 15 and dealer_value >= 7:
            return "HIT"
        else:
            return "STAND"

def _get_alternative_action(primary_action: ActionType) -> ActionType:
    """
    Get an alternative action to the primary recommendation.
    
    This function provides a simple fallback action when the primary
    recommendation is not available or when the player wants to consider
    a different approach.
    
    Args:
        primary_action: The primary recommended action
        
    Returns:
        ActionType: An alternative action that makes sense in most situations
        
    Note:
        The mapping of primary to alternative actions is based on basic
        blackjack strategy. In a more advanced implementation, this could
        be made configurable or based on the specific game rules.
    """
    alternatives = {
        "HIT": "STAND",
        "STAND": "HIT",
        "DOUBLE": "HIT",
        "SPLIT": "HIT",
        "SURRENDER": "STAND"
    }
    return alternatives.get(primary_action, "STAND")
