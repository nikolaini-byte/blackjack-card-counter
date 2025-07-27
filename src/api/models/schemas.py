"""
Data models for the Blackjack Card Counter API.

This module contains Pydantic models for request/response validation.
"""
from pydantic import BaseModel, Field, field_validator, ValidationInfo
from typing import List, Dict, Optional, Union, Any

class CardInput(BaseModel):
    """Input model for card analysis."""
    cards: List[str] = Field(..., description="List of cards in the game")
    dealer_card: str = Field(..., description="Dealer's up card")
    true_count: float = Field(0.0, description="Current true count")
    decks: float = Field(6.0, gt=0, le=10, description="Number of decks in play")
    counting_system: str = Field("hiLo", description="Card counting system to use")
    penetration: float = Field(0.5, ge=0, le=1, description="Deck penetration")
    
    @field_validator('cards')
    @classmethod
    def validate_card_values(cls, cards: List[str]) -> List[str]:
        """Validate each card in the cards list."""
        valid_cards = {"A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"}
        result = []
        for card in cards:
            card_upper = card.upper()
            if card_upper not in valid_cards:
                raise ValueError(f"Invalid card value: {card}")
            result.append(card_upper)
        return result
    
    @field_validator('dealer_card')
    @classmethod
    def validate_dealer_card(cls, v: str) -> str:
        """Validate dealer's up card."""
        valid_cards = {"2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"}
        if not v:
            return ""
        card = v.upper()
        if card not in valid_cards:
            raise ValueError(f"Invalid dealer card: {v}")
        return card
    
    @field_validator('counting_system')
    @classmethod
    def validate_counting_system(cls, v: str) -> str:
        """Validate the counting system."""
        valid_systems = {"hiLo", "hiOptI", "hiOptII", "ko", "omegaII", "zenCount"}
        if v not in valid_systems:
            raise ValueError(f"Invalid counting system: {v}. Must be one of: {', '.join(sorted(valid_systems))}")
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
    
    @field_validator('max_bet')
    @classmethod
    def validate_max_bet_greater_than_min(cls, v: float, info: ValidationInfo) -> float:
        """Validate that max_bet is greater than min_bet."""
        if info.data and 'min_bet' in info.data and v < info.data['min_bet']:
            raise ValueError(f"max_bet ({v}) must be greater than min_bet ({info.data['min_bet']})")
        return v
