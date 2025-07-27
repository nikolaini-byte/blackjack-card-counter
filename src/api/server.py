"""
Blackjack Card Counter API

This module provides a FastAPI-based web service for blackjack strategy and card counting.
"""
from __future__ import annotations

import logging
import os
from collections import defaultdict
from typing import Dict, List, Literal, TypedDict, Any, cast
import math
import numpy as np
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field, field_validator, ConfigDict

from .decision_engine import BlackjackDecisionEngine, get_decision_recommendation
from .middleware.error_handler import (
    BlackjackError,
    InvalidCardError,
    InvalidCountingSystemError,
    InvalidDeckCountError,
    register_error_handlers,
)
from .middleware.request_validation import BlackjackRequest, request_validation_middleware

# Type aliases
Card = str
DeckCount = float
TrueCount = float
Probability = float

# Constants
VALID_CARDS = {'2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'}
VALID_COUNTING_SYSTEMS = {"hiLo", "ko", "omega2", "zenCount"}
MIN_DECKS = 1
MAX_DECKS = 10
MIN_TRUE_COUNT = -20
MAX_TRUE_COUNT = 20

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_app() -> FastAPI:
    """
    Create and configure the FastAPI application.
    
    Returns:
        FastAPI: Configured FastAPI application instance
    """
    app = FastAPI(
        title="Blackjack Analysis API",
        description="Advanced card counting and strategy analysis for Blackjack",
        version="1.0.0",
        docs_url="/api/docs",
        redoc_url="/api/redoc",
        openapi_url="/api/openapi.json"
    )
    
    # Register middleware and error handlers
    app.middleware("http")(request_validation_middleware)
    register_error_handlers(app)
    
    return app

# Create app instance
app = create_app()

# For direct script execution
if __name__ == "__main__":
    import uvicorn
    
    # Run the FastAPI application using uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["Content-Range", "X-Total-Count"],
    max_age=600  # 10 minutes
)

# Mount static files
static_dir = os.path.join(os.path.dirname(__file__), "..", "static")
app.mount("/static", StaticFiles(directory=static_dir), name="static")

class CardInput(BaseModel):
    """Input model for card analysis requests."""
    model_config = ConfigDict(extra='forbid')
    
    cards: List[str] = Field(..., description="List of card values (2-10, J, Q, K, A)")
    dealer_card: str = Field("", description="Dealer's up card")
    true_count: float = Field(0.0, ge=-20.0, le=20.0, description="Current true count")
    decks: float = Field(3.0, gt=0, le=10, description="Number of decks in play")
    counting_system: str = Field("hiLo", description="Card counting system to use")
    penetration: float = Field(0.75, gt=0, le=1.0, description="Deck penetration percentage")
    
    @field_validator('cards', mode='each')
    @classmethod
    def validate_cards(cls, v):
        """Validate each card in the list."""
        if v.upper() not in VALID_CARDS:
            raise ValueError(f"Invalid card value: {v}")
        return v.upper()
    
    @field_validator('dealer_card')
    @classmethod
    def validate_dealer_card(cls, v):
        """Validate dealer's up card."""
        if v and v.upper() not in VALID_CARDS:
            raise ValueError(f"Invalid dealer card: {v}")
        return v.upper() if v else ""
    
    @field_validator('counting_system')
    @classmethod
    def validate_counting_system(cls, v):
        """Validate counting system."""
        if v not in VALID_COUNTING_SYSTEMS:
            raise ValueError(f"Invalid counting system: {v}")
        return v

class PlayerHand(BaseModel):
    """Model representing a player's hand."""
    model_config = ConfigDict(extra='forbid')
    
    cards: List[str] = Field(..., description="List of card values in the hand")
    is_pair: bool = Field(False, description="Whether the hand is a pair")
    is_soft: bool = Field(False, description="Whether the hand is soft (contains an ace counted as 11)")
    value: int = Field(0, ge=0, description="Total value of the hand")

class StrategyRequest(BaseModel):
    """Request model for strategy recommendations."""
    model_config = ConfigDict(extra='forbid')
    
    player_hand: List[str] = Field(..., description="List of card values in player's hand")
    dealer_card: str = Field(..., description="Dealer's up card")
    true_count: float = 0
    decks_remaining: float = 3.0
    counting_system: str = "hiLo"
    
    @field_validator('dealer_card')
    @classmethod
    def validate_dealer_card(cls, v):
        if v.upper() not in VALID_CARDS:
            raise ValueError(f"Invalid dealer card: {v}")
        return v.upper()

class BankrollRequest(BaseModel):
    """Request model for bankroll management calculations."""
    model_config = ConfigDict(extra='forbid')
    
    bankroll: float = Field(..., gt=0, description="Total available bankroll")
    true_count: float = Field(..., ge=-20, le=20, description="Current true count")
    risk_tolerance: float = Field(0.02, gt=0, le=1.0, description="Risk tolerance as a decimal (0-1)")
    min_bet: float = Field(10.0, gt=0, description="Table minimum bet")
    max_bet: float = Field(500.0, gt=0, description="Table maximum bet")
    
    @field_validator('max_bet')
    @classmethod
    def validate_max_bet(cls, v: float, info):
        if 'min_bet' in info.data and v <= info.data['min_bet']:
            raise ValueError("max_bet must be greater than min_bet")
        return v

class CountingSystem(TypedDict):
    """Type definition for counting system configuration."""
    low: Dict[Card, float]    # Cards that increase the count
    neutral: Dict[Card, float]  # Cards that don't affect the count
    high: Dict[Card, float]   # Cards that decrease the count
    name: str                 # System name
    efficiency: float         # Betting correlation (0-1)

# Extended counting systems configuration
COUNTING_SYSTEMS: Dict[str, CountingSystem] = {
    "hiLo": {
        "name": "Hi-Lo",
        "efficiency": 0.97,
        "low": {"2": 1.0, "3": 1.0, "4": 1.0, "5": 1.0, "6": 1.0},
        "neutral": {"7": 0.0, "8": 0.0, "9": 0.0},
        "high": {"10": -1.0, "J": -1.0, "Q": -1.0, "K": -1.0, "A": -1.0}
    },
    "hiOpt2": {
        "name": "Hi-Opt II",
        "efficiency": 0.99,
        "low": {"2": 1.0, "3": 1.0, "4": 2.0, "5": 2.0, "6": 1.0, "7": 1.0},
        "neutral": {"7": 1.0, "8": 0.0, "9": 0.0},
        "high": {"10": -2.0, "J": -2.0, "Q": -2.0, "K": -2.0, "A": 0.0}
    },
    "ko": {
        "name": "Knock-Out",
        "efficiency": 0.98,
        "low": {"2": 1.0, "3": 1.0, "4": 1.0, "5": 1.0, "6": 1.0, "7": 1.0},
        "neutral": {"7": 1.0, "8": 0.0, "9": 0.0},
        "high": {"10": -1.0, "J": -1.0, "Q": -1.0, "K": -1.0, "A": -1.0}
    },
    "halves": {
        "name": "Wong Halves",
        "efficiency": 0.99,
        "low": {"2": 0.5, "3": 1, "4": 1, "5": 1.5, "6": 1, "7": 0.5},
        "neutral": {"8": 0},
        "high": {"9": -0.5, "10": -1, "J": -1, "Q": -1, "K": -1, "A": -1}
    },
    "zenCount": {
        "name": "Zen Count",
        "efficiency": 0.98,
        "low": {"2": 1, "3": 1, "4": 2, "5": 2, "6": 2, "7": 1},
        "neutral": {"8": 0, "9": 0},
        "high": {"10": -2, "J": -2, "Q": -2, "K": -2, "A": -1}
    }
}

# Precompute card values for quick lookup
CARD_VALUES: Dict[Card, int] = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
    'J': 10, 'Q': 10, 'K': 10, 'A': 11  # Aces can be 1 or 11
}

# Initialize card counts per deck
total_cards_per_deck: Dict[str, int] = {
    "A": 4, "2": 4, "3": 4, "4": 4, "5": 4, "6": 4,
    "7": 4, "8": 4, "9": 4, "10": 4, "J": 4, "Q": 4, "K": 4
}

def calculate_running_count(cards: List[Card], system: str = "hiLo") -> float:
    """
    Calculate running count for a specific counting system.
    
    Args:
        cards: List of card values
        system: Counting system to use (default: "hiLo")
        
    Returns:
        float: The running count
        
    Raises:
        InvalidCountingSystemError: If the counting system is not supported
    """
    if system not in COUNTING_SYSTEMS:
        raise InvalidCountingSystemError(system, list(COUNTING_SYSTEMS.keys()))
    
    system_data = COUNTING_SYSTEMS[system]
    count = 0.0
    
    for card in cards:
        card_upper = card.upper()
        if card_upper in system_data["low"]:
            count += system_data["low"][card_upper]
        elif card_upper in system_data["high"]:
            count += system_data["high"][card_upper]
    
    return count

def calculate_true_count(running_count: float, decks_remaining: float) -> TrueCount:
    """
    Calculate the true count based on running count and remaining decks.
    
    Args:
        running_count: The current running count
        decks_remaining: Number of decks remaining in the shoe
        
    Returns:
        TrueCount: The true count, rounded to 1 decimal place
    """
    if decks_remaining <= 0.5:  # Minimum 0.5 decks to avoid division by very small numbers
        return 0.0
    
    true_count = running_count / decks_remaining
    return round(max(MIN_TRUE_COUNT, min(MAX_TRUE_COUNT, true_count)), 1)

def calculate_deck_penetration(cards_seen: int, total_decks: int) -> float:
    """
    Calculate the deck penetration percentage.
    
    Args:
        cards_seen: Number of cards seen/played
        total_decks: Total number of decks in play
        
    Returns:
        float: Penetration percentage (0-1)
        
    Raises:
        ValueError: If total_decks is not positive
    """
    if total_decks <= 0:
        raise ValueError("Total decks must be positive")
    
    total_cards = total_decks * 52
    if cards_seen < 0:
        logger.warning(f"Negative cards_seen value: {cards_seen}")
        cards_seen = 0
    
    return min(1.0, max(0.0, cards_seen / total_cards))

class CardDistribution(TypedDict):
    """Type definition for card distribution analysis."""
    high: float      # 10, J, Q, K, A
    neutral: float   # 7, 8, 9
    low: float       # 2, 3, 4, 5, 6

def create_empty_card_distribution() -> CardDistribution:
    """Create an empty CardDistribution with all values set to 0.0."""
    return {"high": 0.0, "neutral": 0.0, "low": 0.0}

# Card values for probability calculations
card_values = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
    '10': 10, 'J': 10, 'Q': 10, 'K': 10, 'A': 11
}

# Predefined card categories for distribution analysis
HIGH_CARDS = {'10', 'J', 'Q', 'K', 'A'}
NEUTRAL_CARDS = {'7', '8', '9'}
LOW_CARDS = {'2', '3', '4', '5', '6'}

def calculate_card_distribution(cards: List[Card]) -> CardDistribution:
    """
    Analyze the distribution of high, neutral, and low cards in the given list.
    
    Args:
        cards: List of card values to analyze
        
    Returns:
        CardDistribution: Dictionary with the proportion of high, neutral, and low cards
        
    Example:
        >>> calculate_card_distribution(['2', 'K', '10', 'A'])
        {'high': 0.75, 'neutral': 0.0, 'low': 0.25}
    """
    if not cards:
        return create_empty_card_distribution()
    
    high_count = sum(1 for card in cards if card.upper() in HIGH_CARDS)
    neutral_count = sum(1 for card in cards if card.upper() in NEUTRAL_CARDS)
    low_count = len(cards) - high_count - neutral_count
    
    total = len(cards)
    if total == 0:
        return create_empty_card_distribution()
    
    return {
        "high": round(float(high_count) / total, 3),
        "neutral": round(float(neutral_count) / total, 3),
        "low": round(float(low_count) / total, 3)
    }

class BettingRecommendation(TypedDict):
    """Type definition for betting recommendations."""
    bet_amount: float
    kelly_fraction: float
    conservative_fraction: float
    risk_level: Literal["low", "medium", "high"]
    true_count: float
    edge: float



def calculate_expected_value(true_count: float, system: str = "hiLo") -> float:
    """
    Calculate the expected value (player advantage) based on true count and counting system.
    
    Args:
        true_count: The current true count
        system: The counting system being used (default: "hiLo")
        
    Returns:
        float: The player's advantage as a decimal (e.g., 0.01 for 1% advantage)
        
    Raises:
        InvalidCountingSystemError: If an invalid counting system is specified
    """
    if system not in COUNTING_SYSTEMS:
        raise InvalidCountingSystemError(f"Invalid counting system: {system}")
    
    # Get the counting system configuration
    counting_system = COUNTING_SYSTEMS[system]
    
    # Calculate base advantage based on true count
    # This is a simplified model - in practice, this would be more sophisticated
    base_advantage = 0.0
    
    if true_count >= 3.0:
        base_advantage = 0.01 * (true_count - 1.0)  # 1% per true count above 1
    elif true_count <= -3.0:
        base_advantage = 0.01 * (true_count - 1.0)  # -1% per true count below -1
    
    # Adjust based on counting system efficiency
    efficiency = counting_system.get('efficiency', 0.5)
    adjusted_advantage = base_advantage * efficiency
    
    # Cap the advantage to reasonable values
    return max(-0.05, min(0.05, adjusted_advantage))

def calculate_kelly_bet(
    bankroll: float, 
    true_count: float, 
    edge: float, 
    min_bet: float, 
    max_bet: float
) -> BettingRecommendation:
    """
    Calculate optimal bet size using the Kelly Criterion.
    
    Args:
        bankroll: Total available bankroll
        true_count: Current true count
        edge: Player's edge (from calculate_expected_value)
        min_bet: Table minimum bet
        max_bet: Table maximum bet
        
    Returns:
        BettingRecommendation: Dictionary containing bet details
        
    Raises:
        ValueError: If bankroll, min_bet, or max_bet are not positive
    """
    if bankroll <= 0:
        raise ValueError("Bankroll must be positive")
    if min_bet <= 0 or max_bet <= 0:
        raise ValueError("Minimum and maximum bet must be positive")
    if min_bet > max_bet:
        raise ValueError("Minimum bet cannot exceed maximum bet")
    
    # Round true count to 1 decimal place for consistency
    rounded_true_count = round(true_count, 1)
    
    # If no edge or negative true count, bet minimum
    if edge <= 0 or true_count <= 0:
        return BettingRecommendation(
            bet_amount=float(min_bet),
            kelly_fraction=0.0,
            conservative_fraction=0.0,
            risk_level="low",
            true_count=rounded_true_count,
            edge=float(round(edge * 100, 2))
        )
    
    # Blackjack variance is approximately 1.3
    VARIANCE = 1.3
    
    # Full Kelly fraction: f* = edge / variance
    kelly_fraction = edge / VARIANCE
    
    # Apply fractional Kelly (25% of full Kelly) for risk management
    conservative_kelly = kelly_fraction * 0.25
    
    # Calculate bet amount based on bankroll and Kelly fraction
    bet_amount = bankroll * conservative_kelly
    
    # Ensure bet is within table limits
    bet_amount = max(min_bet, min(bet_amount, max_bet))
    
    # Determine risk level based on Kelly fraction
    if kelly_fraction < 0.01:
        risk_level: Literal["low", "medium", "high"] = "low"
    elif kelly_fraction < 0.03:
        risk_level = "medium"
    else:
        risk_level = "high"
    
    return BettingRecommendation(
        bet_amount=float(round(bet_amount, 2)),
        kelly_fraction=float(round(kelly_fraction, 4)),
        conservative_fraction=float(round(conservative_kelly, 4)),
        risk_level=risk_level,
        true_count=rounded_true_count,
        edge=float(round(edge * 100, 2))  # Return as percentage
    )

def calculate_win_probability_detailed(
    player_cards: List[Card],
    dealer_card: str,
    remaining_cards: Dict[str, int],
    total_remaining: int
) -> Dict[str, float]:
    """
    Calculate detailed win/loss probabilities for the player's hand.
    
    Args:
        player_cards: List of cards in player's hand
        dealer_card: Dealer's up card
        remaining_cards: Count of each card remaining in the deck
        total_remaining: Total number of cards remaining
        
    Returns:
        Dictionary with win/loss probabilities
    """
    # This is a simplified implementation - in a real system, this would use
    # more sophisticated probability calculations
    player_value = sum(card_values.get(card, 0) for card in player_cards)
    dealer_value = card_values.get(dealer_card, 0)
    
    # Simple win probability estimation based on hand values
    if player_value > 21:
        return {"win": 0.0, "lose": 1.0, "push": 0.0}
    
    # Count remaining cards that could help or hurt the player
    helpful_cards = 0
    harmful_cards = 0
    
    for card, count in remaining_cards.items():
        card_val = card_values.get(card, 0)
        if player_value + card_val <= 21:
            helpful_cards += count
        else:
            harmful_cards += count
    
    total_cards = helpful_cards + harmful_cards
    if total_cards == 0:
        return {"win": 0.5, "lose": 0.5, "push": 0.0}
    
    win_prob = helpful_cards / total_cards
    return {
        "win": win_prob * 0.8,  # Factor in dealer's advantage
        "lose": (1 - win_prob) * 1.2,  # Dealer has slight advantage
        "push": 0.0  # Simplified for this example
    }

def calculate_advanced_probabilities(
    player_cards: List[Card], 
    dealer_card: str, 
    cards_seen: List[Card], 
    decks: float
) -> Dict[str, float]:
    """Detailed probability calculation"""
    if not player_cards or not dealer_card:
        raise ValueError("Player cards and dealer card are required")
    
    # Count seen cards
    seen_counts: Dict[str, int] = defaultdict(int)
    for card in cards_seen:
        card_upper = card.upper()
        if card_upper not in total_cards_per_deck:
            raise ValueError(f"Invalid card in seen cards: {card}")
        seen_counts[card_upper] += 1
    
    # Calculate remaining cards
    remaining_cards: Dict[str, int] = {}
    for card, count in total_cards_per_deck.items():
        remaining_cards[card] = count * decks - seen_counts[card]
    
    # Calculate total remaining cards
    total_remaining = sum(remaining_cards.values())
    
    if total_remaining == 0:
        raise ValueError("No cards remaining in the deck")
    
    # Calculate hand value
    hand_value = 0
    aces = 0
    
    for card in player_cards:
        try:
            card_upper = card.upper()
            if card_upper not in CARD_VALUES:
                raise ValueError(f"Invalid card in player hand: {card}")
                
            if card_upper == 'A':
                aces += 1
                hand_value += 11
            else:
                hand_value += CARD_VALUES[card_upper]
                
        except (KeyError, AttributeError) as e:
            raise ValueError(f"Invalid card in player hand: {card}") from e
    
    # Adjust for aces if needed
    while hand_value > 21 and aces > 0:
        hand_value -= 10
        aces -= 1
    
    # Get dealer card value
    try:
        dealer_card_upper = dealer_card.upper()
        if dealer_card_upper not in CARD_VALUES:
            raise ValueError(f"Invalid dealer card: {dealer_card}")
        dealer_card_value = CARD_VALUES[dealer_card_upper]
    except (KeyError, AttributeError) as e:
        raise ValueError(f"Invalid dealer card: {dealer_card}") from e
    
    # Calculate probabilities
    bust_prob = calculate_bust_probability(hand_value, remaining_cards, total_remaining)
    dealer_bust_prob = calculate_dealer_bust_probability(dealer_card_value, remaining_cards, total_remaining)
    win_prob = calculate_win_probability_detailed(
        player_cards=player_cards,
        dealer_card=dealer_card,
        remaining_cards=remaining_cards,
        total_remaining=total_remaining
    )
    # Ensure probabilities are valid and sum to 1.0
    bust_prob_value = float(max(0.0, min(1.0, bust_prob)))
    dealer_bust_prob_value = float(max(0.0, min(1.0, dealer_bust_prob)))
    win_prob_values = {k: float(max(0.0, min(1.0, v))) for k, v in win_prob.items()}
    
    # Normalize win probabilities to sum to 1.0
    total = sum(win_prob_values.values())
    if total > 0:
        win_prob_values = {k: v / total for k, v in win_prob_values.items()}
    
    return {
        "bust_probability": bust_prob_value,
        "dealer_bust_probability": dealer_bust_prob_value,
        "win_probabilities": win_prob_values,
        "true_count": true_count,
        "penetration": penetration,
        "card_distribution": card_distribution
    }

def calculate_bust_probability(hand_value: int, remaining_cards: Dict[str, int], total_remaining: int) -> float:
    """Calculate the probability of busting on the next hit."""
    if hand_value >= 21 or total_remaining == 0:
        return 0.0
    
    bust_cards = 0
    for card, count in remaining_cards.items():
        card_value = CARD_VALUES[card]
        if hand_value + card_value > 21:
            bust_cards += count
    
    return bust_cards / total_remaining

def calculate_dealer_bust_probability(dealer_card_value: int, remaining_cards: Dict[str, int], total_remaining: int) -> float:
    """Calculate the probability of the dealer busting."""
    if dealer_card_value >= 17 or total_remaining == 0:
        return 0.0
    
    # Calculate win matrix (simplified for this example)
    win_matrix: Dict[str, Dict[int, float]] = {
        '2': {12: 0.3, 13: 0.4, 14: 0.5, 15: 0.6, 16: 0.7, 17: 0.8, 18: 0.9, 19: 1.0, 20: 1.0, 21: 1.0},
        '3': {12: 0.2, 13: 0.3, 14: 0.4, 15: 0.5, 16: 0.6, 17: 0.7, 18: 0.8, 19: 0.9, 20: 1.0, 21: 1.0},
        '4': {12: 0.1, 13: 0.2, 14: 0.3, 15: 0.4, 16: 0.5, 17: 0.6, 18: 0.7, 19: 0.8, 20: 0.9, 21: 1.0},
        '5': {12: 0.0, 13: 0.1, 14: 0.2, 15: 0.3, 16: 0.4, 17: 0.5, 18: 0.6, 19: 0.7, 20: 0.8, 21: 0.9},
        '6': {12: -0.1, 13: 0.0, 14: 0.1, 15: 0.2, 16: 0.3, 17: 0.4, 18: 0.5, 19: 0.6, 20: 0.7, 21: 0.8},
        '7': {12: -0.2, 13: -0.1, 14: 0.0, 15: 0.1, 16: 0.2, 17: 0.3, 18: 0.4, 19: 0.5, 20: 0.6, 21: 0.7},
        '8': {12: -0.3, 13: -0.2, 14: -0.1, 15: 0.0, 16: 0.1, 17: 0.2, 18: 0.3, 19: 0.4, 20: 0.5, 21: 0.6},
        '9': {12: -0.4, 13: -0.3, 14: -0.2, 15: -0.1, 16: 0.0, 17: 0.1, 18: 0.2, 19: 0.3, 20: 0.4, 21: 0.5},
        '10': {12: -0.5, 13: -0.4, 14: -0.3, 15: -0.2, 16: -0.1, 17: 0.0, 18: 0.1, 19: 0.2, 20: 0.3, 21: 0.4},
        'J': {12: -0.5, 13: -0.4, 14: -0.3, 15: -0.2, 16: -0.1, 17: 0.0, 18: 0.1, 19: 0.2, 20: 0.3, 21: 0.4},
        'Q': {12: -0.5, 13: -0.4, 14: -0.3, 15: -0.2, 16: -0.1, 17: 0.0, 18: 0.1, 19: 0.2, 20: 0.3, 21: 0.4},
        'K': {12: -0.5, 13: -0.4, 14: -0.3, 15: -0.2, 16: -0.1, 17: 0.0, 18: 0.1, 19: 0.2, 20: 0.3, 21: 0.4},
        'A': {12: -0.6, 13: -0.5, 14: -0.4, 15: -0.3, 16: -0.2, 17: -0.1, 18: 0.0, 19: 0.1, 20: 0.2, 21: 0.3}
    }
    
    base_prob = win_matrix.get(dealer_card, {}).get(player_total, 0.3)
    
    # Adjust based on remaining card composition
    high_cards = sum(remaining_cards.get(card, 0) for card in ['10', 'J', 'Q', 'K', 'A'])
    high_card_ratio = high_cards / max(total_remaining, 1)
    
    # More high cards favor dealer bust, helping player
    adjustment = (high_card_ratio - 0.38) * 0.05
    
    return max(0.1, min(0.9, base_prob + adjustment))

# Debug endpoint to inspect request data
@app.post("/debug/analyze")
async def debug_analyze_cards(request: Request):
    """Debug endpoint to inspect the raw request data"""
    try:
        # Get raw request body
        body = await request.body()
        body_str = body.decode('utf-8')
        
        # Get headers
        headers = dict(request.headers)
        
        # Log the raw request
        print("\n[DEBUG] Raw request data:")
        print(f"Method: {request.method}")
        print(f"URL: {request.url}")
        print("Headers:")
        for k, v in headers.items():
            print(f"  {k}: {v}")
        print(f"Body: {body_str}")
        
        # Try to parse the JSON
        try:
            json_data = await request.json()
            print("\n[DEBUG] Parsed JSON data:")
            print(json_data)
        except Exception as e:
            print(f"\n[ERROR] Failed to parse JSON: {str(e)}")
            json_data = None
        
        return {
            "status": "debug_info",
            "method": request.method,
            "url": str(request.url),
            "headers": headers,
            "body": body_str,
            "parsed_json": json_data
        }
    except Exception as e:
        print(f"[ERROR] Debug endpoint error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Debug error: {str(e)}")

@app.post("/analyze")
async def analyze_cards(data: CardInput) -> Dict[str, Any]:
    try:
        # Log the raw request data
        print(f"\n[DEBUG] ===== NEW REQUEST TO /analyze =====")
        print(f"[DEBUG] Received data object type: {type(data).__name__}")
        
        # Convert Pydantic model to dict for inspection
        data_dict = data.dict() if hasattr(data, 'dict') else {}
        print(f"[DEBUG] Data as dictionary: {data_dict}")
        
        # Check if cards exist in the request
        if not hasattr(data, 'cards') or not data.cards:
            print("[ERROR] No cards provided in request")
            raise HTTPException(status_code=400, detail="No cards provided")
        
        print(f"[DEBUG] Cards: {data.cards}")
        print(f"[DEBUG] Dealer card: {getattr(data, 'dealer_card', 'Not found')}")
        print(f"[DEBUG] Decks: {getattr(data, 'decks', 'Not found')}")
        print(f"[DEBUG] Counting system: {getattr(data, 'counting_system', 'Not found')}")
        
        # Ensure all required fields are present with defaults if needed
        dealer_card = getattr(data, 'dealer_card', 'A')
        decks = float(getattr(data, 'decks', 6.0))
        counting_system = getattr(data, 'counting_system', 'hiLo')
        
        # Calculate player's hand value
        player_cards = data.cards
        player_total = 0
        aces = 0
        
        # Calculate initial total and count aces
        for card in player_cards:
            if card.upper() == 'A':
                player_total += 11
                aces += 1
            elif card.upper() in ['K', 'Q', 'J']:
                player_total += 10
            else:
                try:
                    player_total += int(card)
                except (ValueError, TypeError):
                    print(f"[WARNING] Invalid card value: {card}, treating as 0")
        
        # Adjust for aces if total is over 21
        while player_total > 21 and aces > 0:
            player_total -= 10
            aces -= 1
            
        print(f"[DEBUG] Player's hand value: {player_total}")
        
        # Calculate running count and true count
        running_count = calculate_running_count(player_cards, counting_system)
        remaining_cards = decks * 52 - len(player_cards)
        remaining_decks = max(remaining_cards / 52, 0.5)
        true_count_value = calculate_true_count(running_count, remaining_decks)
        
        # Calculate deck penetration
        total_cards = int(decks * 52)
        penetration_value = calculate_deck_penetration(len(player_cards), total_cards)
        
        # Calculate card distribution
        card_dist = calculate_card_distribution(player_cards)
        
        # Calculate expected value
        expected_val = calculate_expected_value(true_count_value, counting_system)
        
        # Calculate advanced probabilities
        advanced_probs = calculate_advanced_probabilities(
            player_cards[:2] if len(player_cards) >= 2 else player_cards,
            dealer_card,
            player_cards,
            decks
        )
        
        # Prepare the response with all required fields
        result = {
            "running_count": running_count,
            "true_count": true_count_value,
            "penetration": penetration_value,
            "card_distribution": card_dist,
            "expected_value": expected_val,
            "advanced_probabilities": advanced_probs,
            "player_total": player_total,
            "dealer_card": dealer_card,
            "decks": decks,
            "counting_system": counting_system,
            "recommended_action": "stand" if player_total >= 17 else "hit",
            "risk_level": "high" if true_count_value > 2 else "medium" if true_count_value > 0 else "low"
        }
        
        print(f"[DEBUG] Successfully processed request. Result: {result}")
        return result
        
    except Exception as e:
        error_msg = f"Error in /analyze endpoint: {str(e)}"
        print(f"[ERROR] {error_msg}")
        print(f"[ERROR] Exception type: {type(e).__name__}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=error_msg)

@app.post("/bankroll")
async def calculate_bankroll_management(data: BankrollRequest) -> Dict[str, Any]:
    """Calculate optimal bankroll management"""
    expected_value = calculate_expected_value(data.true_count)
    kelly_analysis = calculate_kelly_bet(
        data.bankroll, data.true_count, expected_value,
        data.min_bet, data.max_bet
    )
    
    # Risk of Ruin calculation
    risk_of_ruin = calculate_risk_of_ruin(
        data.bankroll, kelly_analysis["bet_amount"], expected_value
    )
    
    sessions_to_double = calculate_sessions_to_double(expected_value, kelly_analysis["bet_amount"])
    
    return {
        "recommended_bet": kelly_analysis["bet_amount"],
        "kelly_fraction": kelly_analysis["kelly_fraction"],
        "risk_level": kelly_analysis["risk_level"],
        "expected_value": expected_value,
        "risk_of_ruin": risk_of_ruin,
        "sessions_to_double": sessions_to_double,
        "bankroll_units": data.bankroll / kelly_analysis["bet_amount"]
    }

@app.post("/strategy")
async def get_optimal_strategy(data: StrategyRequest) -> Dict[str, Any]:
    """Get mathematically optimal strategy decision"""
    try:
        # Validate input
        if not data.player_hand or not data.dealer_card:
            raise HTTPException(status_code=400, detail="Player hand and dealer card are required")
        
        # Get all cards seen (for now, just player hand + dealer card)
        # In a real implementation, this would include all cards seen in the current shoe
        seen_cards = data.player_hand + [data.dealer_card]
        
        # Get optimal decision from the mathematical engine
        decision = get_decision_recommendation(
            player_cards=data.player_hand,
            dealer_card=data.dealer_card,
            seen_cards=seen_cards,
            true_count=data.true_count,
            num_decks=int(data.decks_remaining * 1.5)  # Approximate total decks
        )
        
        # Add additional context
        decision['counting_system'] = data.counting_system
        decision['decks_remaining'] = data.decks_remaining
        
        # Add recommendation text in both languages
        action_translations = {
            'hit': {'en': 'Hit', 'de': 'Karte ziehen'},
            'stand': {'en': 'Stand', 'de': 'Stehen bleiben'},
            'double': {'en': 'Double Down', 'de': 'Verdoppeln'},
            'split': {'en': 'Split', 'de': 'Teilen'}
        }
        
        action = decision['action']
        decision['recommendation'] = {
            'action': action,
            'text_en': action_translations.get(action, {}).get('en', action.title()),
            'text_de': action_translations.get(action, {}).get('de', action.title()),
            'confidence_level': 'high' if decision['confidence'] > 0.1 else 'medium' if decision['confidence'] > 0.05 else 'low'
        }
        
        return decision
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Strategy calculation error: {str(e)}")

def get_play_recommendation(true_count: float, expected_value: float) -> str:
    """Provide play recommendation based on true count and EV"""
    if expected_value > 0.02:
        return "aggressive_play"
    elif expected_value > 0:
        return "standard_play"
    elif true_count < -2:
        return "conservative_play"
    else:
        return "basic_strategy"

def calculate_risk_of_ruin(bankroll: float, bet_size: float, edge: float) -> float:
    """
    Calculate the risk of ruin based on bankroll, bet size, and player edge.
    
    Args:
        bankroll: Total available bankroll
        bet_size: Size of each bet
        edge: Player's edge (as a decimal)
        
    Returns:
        float: Probability of ruin (0 to 1)
    """
    if bankroll <= 0 or bet_size <= 0:
        return 1.0  # Already ruined or invalid inputs
        
    if edge >= 1.0 or edge <= -1.0:
        return 0.0 if edge > 0 else 1.0  # Certain win or loss
        
    # Kelly criterion risk of ruin approximation
    kelly_fraction = edge / (1.0 - edge)  # Simplified for even-money bets
    optimal_bet = bankroll * kelly_fraction
    
    if bet_size >= optimal_bet * 2:
        return 1.0  # Overbetting leads to certain ruin
        
    # Calculate risk of ruin using the formula: ((1 - edge) / (1 + edge))^(bankroll/bet_size)
    try:
        risk = math.pow((1 - edge) / (1 + edge), bankroll / bet_size)
        return min(1.0, max(0.0, risk))
    except (ValueError, ZeroDivisionError):
        return 0.5  # Fallback for edge cases

def calculate_sessions_to_double(edge: float, bet_size: float) -> float:
    """
    Estimate number of sessions needed to double bankroll.
    
    Args:
        edge: Player's edge (as a decimal)
        bet_size: Average bet size as fraction of bankroll
        
    Returns:
        int: Estimated number of sessions to double bankroll (rounded up)
    """
    if edge <= 0 or bet_size <= 0:
        return float('inf')  # Will never double with no edge or no betting
        
    # Using the Rule of 72 as a simple approximation
    # Adjusted for blackjack where edge is per hand, not per bet
    sessions = math.log(2) / (edge * bet_size)
    return max(1, math.ceil(sessions))

@app.get("/")
async def root() -> Dict[str, str]:
    """Root endpoint that returns a welcome message.
    
    Returns:
        Dict[str, str]: A welcome message
    """
    return {"message": "Blackjack Card Counter API"}

if __name__ == "__main__":
    import uvicorn
    import sys
    import os
    
    # Add parent directory to path for config import
    sys.path.append(os.path.join(os.path.dirname(__file__), '../..'))
    from config import API_PORT, SERVER_HOST
    
    uvicorn.run(app, host=SERVER_HOST, port=API_PORT)