"""
Blackjack Card Counter API

This module provides a FastAPI-based web service for blackjack strategy and card counting.
"""
from fastapi import FastAPI, Request, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.exceptions import RequestValidationError
from pydantic import BaseModel, validator, Field
from typing import List, Dict, Optional, Union
import numpy as np
import os
import math
import logging
from collections import defaultdict
from pathlib import Path

# Import the new decision engine
from .decision_engine import get_decision_recommendation, BlackjackDecisionEngine

# Import middleware
from .middleware.error_handler import (
    register_error_handlers,
    BlackjackError,
    InvalidCardError,
    InvalidDeckCountError,
    InvalidCountingSystemError
)
from .middleware.request_validation import request_validation_middleware

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
    
    # Register middleware
    app.middleware("http")(request_validation_middleware)
    register_error_handlers(app)
    
    # Configure CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Mount static files
    static_dir = os.path.join(Path(__file__).parent.parent, "static")
    app.mount("/static", StaticFiles(directory=static_dir), name="static")
    
    return app

# Create the FastAPI app
app = create_app()

# Define request/response models
class CardInput(BaseModel):
    """Input model for card analysis."""
    cards: List[str] = Field(..., description="List of cards in the game")
    dealer_card: str = Field(..., description="Dealer's up card")
    true_count: Optional[float] = Field(0.0, description="Current true count")
    decks: float = Field(6.0, gt=0, le=10, description="Number of decks in play")
    counting_system: str = Field("hiLo", description="Card counting system to use")
    penetration: Optional[float] = Field(0.5, ge=0, le=1, description="Deck penetration")
    
    @validator('cards', each_item=True)
    def validate_card_values(cls, v):
        """Validate each card in the cards list."""
        valid_cards = {"A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"}
        if v.upper() not in valid_cards:
            raise ValueError(f"Invalid card value: {v}")
        return v.upper()
    
    @validator('dealer_card')
    def validate_dealer_card(cls, v):
        """Validate dealer's up card."""
        valid_cards = {"2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"}
        if v and v.upper() not in valid_cards:
            raise ValueError(f"Invalid dealer card: {v}")
        return v.upper() if v else ""
    
    @validator('counting_system')
    def validate_counting_system(cls, v):
        """Validate the counting system."""
        valid_systems = {"hiLo", "hiOptI", "hiOptII", "ko", "omegaII", "zenCount"}
        if v not in valid_systems:
            raise ValueError(f"Invalid counting system: {v}")
        return v

class StrategyRequest(BaseModel):
    """Input model for strategy recommendations."""
    player_hand: List[str] = Field(..., description="Player's current hand")
    dealer_card: str = Field(..., description="Dealer's up card")
    true_count: float = Field(0.0, description="Current true count")
    decks_remaining: float = Field(6.0, gt=0, le=10, description="Number of decks remaining")
    counting_system: str = Field("hiLo", description="Card counting system to use")

class BankrollRequest(BaseModel):
    """Input model for bankroll management."""
    bankroll: float = Field(..., gt=0, description="Current bankroll")
    true_count: float = Field(..., description="Current true count")
    risk_tolerance: float = Field(0.02, gt=0, le=1, description="Risk tolerance (0-1)")
    min_bet: float = Field(10.0, gt=0, description="Minimum bet amount")
    max_bet: float = Field(500.0, gt=0, description="Maximum bet amount")
    
    @validator('max_bet')
    def validate_max_bet_greater_than_min(cls, v, values):
        """Validate that max_bet is greater than min_bet."""
        if 'min_bet' in values and v < values['min_bet']:
            raise ValueError("max_bet must be greater than min_bet")
        return v

# Define counting systems
COUNTING_SYSTEMS = {
    "hiLo": {
        "2": 1, "3": 1, "4": 1, "5": 1, "6": 1,
        "7": 0, "8": 0, "9": 0,
        "10": -1, "J": -1, "Q": -1, "K": -1, "A": -1
    },
    "hiOptI": {
        "2": 0, "3": 1, "4": 1, "5": 1, "6": 1,
        "7": 1, "8": 0, "9": 0,
        "10": -1, "J": -1, "Q": -1, "K": -1, "A": 0
    },
    "hiOptII": {
        "2": 1, "3": 1, "4": 2, "5": 2, "6": 1,
        "7": 1, "8": 0, "9": 0,
        "10": -2, "J": -2, "Q": -2, "K": -2, "A": 0
    },
    "ko": {
        "2": 1, "3": 1, "4": 1, "5": 1, "6": 1,
        "7": 1, "8": 0, "9": 0,
        "10": -1, "J": -1, "Q": -1, "K": -1, "A": -1
    },
    "omegaII": {
        "2": 1, "3": 1, "4": 2, "5": 2, "6": 2,
        "7": 1, "8": 0, "9": -1,
        "10": -2, "J": -2, "Q": -2, "K": -2, "A": 0
    },
    "zenCount": {
        "2": 1, "3": 1, "4": 2, "5": 2, "6": 2,
        "7": 1, "8": 0, "9": -1,
        "10": -2, "J": -2, "Q": -2, "K": -2, "A": -1
    }
}

# API endpoints
@app.get("/", response_class=HTMLResponse)
async def root():
    """Serve the main HTML page."""
    html_path = Path(__file__).parent.parent / "templates" / "index.html"
    with open(html_path, "r") as f:
        return f.read()

@app.post("/analyze")
async def analyze_cards(data: CardInput):
    """
    Analyze the current game state and provide recommendations.
    
    Args:
        data: CardInput model with game state
        
    Returns:
        dict: Analysis and recommendations
    """
    if not data.cards:
        raise HTTPException(status_code=400, detail="No cards provided")
    
    # Advanced analysis
    counting_system = COUNTING_SYSTEMS.get(data.counting_system, COUNTING_SYSTEMS["hiLo"])
    
    # Calculate running count
    running_count = sum(counting_system.get(card, 0) for card in data.cards)
    
    # Calculate true count
    remaining_decks = max(0.5, data.decks - (len(data.cards) / 52))
    true_count = running_count / remaining_decks
    
    # Calculate deck penetration
    cards_remaining = (data.decks * 52) - len(data.cards)
    deck_penetration = 1 - (cards_remaining / (data.decks * 52))
    
    # Get decision recommendation
    decision = get_decision_recommendation(
        player_cards=data.cards,
        dealer_card=data.dealer_card,
        seen_cards=data.cards,
        true_count=true_count,
        num_decks=data.decks
    )
    
    # Calculate hand value
    hand_value = self.calculate_hand_value(data.cards)
    
    # Calculate probabilities
    probabilities = self.calculate_advanced_probabilities(
        player_cards=data.cards,
        dealer_card=data.dealer_card,
        cards_seen=data.cards,
        decks=data.decks
    )
    
    return {
        "counting_analysis": {
            "running_count": running_count,
            "true_count": round(true_count, 2),
            "cards_remaining": int(cards_remaining),
            "deck_penetration": round(deck_penetration, 2),
            "recommendation": decision.get("action", "STAND")
        },
        "statistics": {
            "player_hand_value": hand_value,
            "bust_probability": probabilities.get("bust", 0.0),
            "win_probability": probabilities.get("win", 0.0),
            "push_probability": probabilities.get("push", 0.0),
            "lose_probability": probabilities.get("lose", 0.0)
        },
        "recommendations": {
            "action": decision.get("action", "STAND"),
            "confidence": decision.get("confidence", 0.0),
            "alternatives": decision.get("alternatives", [])
        }
    }

@app.post("/strategy")
async def get_strategy(data: StrategyRequest):
    """
    Get optimal strategy for the current hand.
    
    Args:
        data: StrategyRequest model with hand and game state
        
    Returns:
        dict: Strategy recommendation
    """
    # Get decision recommendation
    decision = get_decision_recommendation(
        player_cards=data.player_hand,
        dealer_card=data.dealer_card,
        seen_cards=[],
        true_count=data.true_count,
        num_decks=data.decks_remaining
    )
    
    return decision

@app.post("/bankroll")
async def manage_bankroll(data: BankrollRequest):
    """
    Calculate optimal bet size based on bankroll and true count.
    
    Args:
        data: BankrollRequest model with bankroll and game state
        
    Returns:
        dict: Betting recommendations
    """
    # Calculate Kelly Criterion bet size
    kelly_bet = (data.bankroll * data.true_count * 0.01) / 2  # Conservative Kelly
    half_kelly_bet = kelly_bet / 2
    
    # Calculate recommended bet (clamped to min/max)
    recommended_bet = max(
        data.min_bet,
        min(
            data.max_bet,
            half_kelly_bet * data.bankroll
        )
    )
    
    # Calculate risk of ruin (simplified)
    risk_of_ruin = max(0.001, min(0.5, 0.5 ** (data.true_count / 2)))
    
    # Calculate expected value
    expected_value = recommended_bet * (0.5 + (data.true_count * 0.005))
    
    return {
        "recommended_bet": round(recommended_bet, 2),
        "risk_of_ruin": round(risk_of_ruin, 4),
        "expected_value": round(expected_value, 2),
        "kelly_bet": round(kelly_bet, 2),
        "half_kelly_bet": round(half_kelly_bet, 2)
    }

# Helper methods
def calculate_hand_value(cards: List[str]) -> int:
    """Calculate the value of a hand of cards."""
    value = 0
    aces = 0
    
    for card in cards:
        if card == 'A':
            aces += 1
            value += 11
        elif card in ['K', 'Q', 'J', '10']:
            value += 10
        else:
            value += int(card)
    
    # Adjust for aces
    while value > 21 and aces > 0:
        value -= 10
        aces -= 1
    
    return value

def calculate_advanced_probabilities(player_cards: List[str], dealer_card: str, 
                                   cards_seen: List[str], decks: float) -> Dict[str, float]:
    """Advanced probability calculation"""
    # Calculate remaining cards
    total_cards_per_deck = {"A": 4, "2": 4, "3": 4, "4": 4, "5": 4, "6": 4,
                           "7": 4, "8": 4, "9": 4, "10": 16}  # 10, J, Q, K
    
    # Initialize remaining cards
    remaining_cards = {}
    for card, count in total_cards_per_deck.items():
        remaining_cards[card] = int(count * decks)
    
    # Remove seen cards
    for card in cards_seen:
        if card in remaining_cards:
            remaining_cards[card] -= 1
            if remaining_cards[card] < 0:
                remaining_cards[card] = 0
    
    # Calculate total remaining cards
    total_remaining = sum(remaining_cards.values())
    
    # Simple probability calculation (simplified for example)
    if total_remaining == 0:
        return {"bust": 0.0, "win": 0.5, "lose": 0.5, "push": 0.0}
    
    # Calculate probability of busting on next hit
    bust_cards = 0
    hand_value = calculate_hand_value(player_cards)
    
    for card, count in remaining_cards.items():
        new_hand = player_cards + [card]
        new_value = calculate_hand_value(new_hand)
        if new_value > 21:
            bust_cards += count
    
    bust_probability = bust_cards / total_remaining
    
    # Very simplified win/lose/push calculation
    # In a real implementation, this would use more sophisticated simulation
    return {
        "bust": round(bust_probability, 4),
        "win": round(0.4 * (1 - bust_probability), 4),  # Placeholder
        "lose": round(0.5 * (1 - bust_probability), 4),  # Placeholder
        "push": round(0.1 * (1 - bust_probability), 4)   # Placeholder
    }

def get_play_recommendation(true_count: float, expected_value: float) -> str:
    """Provide play recommendation based on true count and EV"""
    if expected_value > 0.02:
        return "aggressive_play"
    elif expected_value > 0:
        return "standard_play"
    else:
        return "conservative_play"

# Add instance methods to the app for helper functions
app.calculate_hand_value = calculate_hand_value
app.calculate_advanced_probabilities = calculate_advanced_probabilities
app.get_play_recommendation = get_play_recommendation
