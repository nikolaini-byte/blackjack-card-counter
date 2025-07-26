from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List, Dict, Optional
import numpy as np
import os
import math
from collections import defaultdict

# Import the new decision engine
from decision_engine import get_decision_recommendation, BlackjackDecisionEngine

app = FastAPI(
    title="Blackjack Analysis API",
    description="Advanced card counting and strategy analysis for Blackjack",
    version="1.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
static_dir = os.path.join(os.path.dirname(__file__), "..", "static")
app.mount("/static", StaticFiles(directory=static_dir), name="static")

class CardInput(BaseModel):
    cards: List[str]
    dealer_card: str = ""
    true_count: float = 0
    decks: float = 3.0
    counting_system: str = "hiLo"
    penetration: float = 0.75  # Deck penetration percentage

class PlayerHand(BaseModel):
    cards: List[str]
    is_pair: bool = False
    is_soft: bool = False
    value: int = 0

class StrategyRequest(BaseModel):
    player_hand: List[str]
    dealer_card: str
    true_count: float = 0
    decks_remaining: float = 3.0
    counting_system: str = "hiLo"

class BankrollRequest(BaseModel):
    bankroll: float
    true_count: float
    risk_tolerance: float = 0.02  # 2% risk of ruin
    min_bet: float = 10.0
    max_bet: float = 500.0

# Extended counting systems
COUNTING_SYSTEMS = {
    "hiLo": {
        "2": 1, "3": 1, "4": 1, "5": 1, "6": 1,
        "7": 0, "8": 0, "9": 0,
        "10": -1, "J": -1, "Q": -1, "K": -1, "A": -1
    },
    "ko": {  # Knock-Out system
        "2": 1, "3": 1, "4": 1, "5": 1, "6": 1, "7": 1,
        "8": 0, "9": 0,
        "10": -1, "J": -1, "Q": -1, "K": -1, "A": -1
    },
    "omegaII": {  # Omega II system
        "2": 1, "3": 1, "4": 2, "5": 2, "6": 2, "7": 1,
        "8": 0, "9": -1,
        "10": -2, "J": -2, "Q": -2, "K": -2, "A": 0
    },
    "halves": {  # Wong Halves system
        "2": 0.5, "3": 1, "4": 1, "5": 1.5, "6": 1, "7": 0.5,
        "8": 0, "9": -0.5,
        "10": -1, "J": -1, "Q": -1, "K": -1, "A": -1
    },
    "zenCount": {  # Zen Count system
        "2": 1, "3": 1, "4": 2, "5": 2, "6": 2, "7": 1,
        "8": 0, "9": 0,
        "10": -2, "J": -2, "Q": -2, "K": -2, "A": -1
    }
}

def calculate_running_count(cards: List[str], system: str = "hiLo") -> float:
    """Calculate running count for a specific counting system"""
    if system not in COUNTING_SYSTEMS:
        raise ValueError(f"Unknown counting system: {system}")
    
    count_values = COUNTING_SYSTEMS[system]
    return sum(count_values.get(card, 0) for card in cards)

def calculate_true_count(running_count: float, decks_remaining: float) -> float:
    """Calculate true count"""
    if decks_remaining <= 0:
        return 0
    true_count = running_count / decks_remaining
    return round(true_count, 1)  # Round to 1 decimal place

def calculate_deck_penetration(cards_seen: int, total_decks: int) -> float:
    """Calculate deck penetration"""
    total_cards = total_decks * 52
    return cards_seen / total_cards

def calculate_card_distribution(cards: List[str]) -> Dict[str, float]:
    """Analyze card distribution"""
    total = len(cards)
    if total == 0:
        return {"high": 0, "neutral": 0, "low": 0}
    
    high_cards = len([c for c in cards if c in ['10', 'J', 'Q', 'K', 'A']])
    neutral_cards = len([c for c in cards if c in ['7', '8', '9']])
    low_cards = len([c for c in cards if c in ['2', '3', '4', '5', '6']])
    
    return {
        "high": high_cards / total,
        "neutral": neutral_cards / total,
        "low": low_cards / total
    }

def calculate_expected_value(true_count: float, system: str = "hiLo") -> float:
    """Calculate expected value based on true count"""
    # Base house edge for blackjack (approximately 0.5%)
    base_edge = -0.005
    
    # Count advantage varies by system
    count_advantages = {
        "hiLo": 0.005,      # ~0.5% per true count
        "ko": 0.0045,       # Slightly less than Hi-Lo
        "omegaII": 0.0055,  # More accurate, higher advantage
        "halves": 0.006,    # Most accurate, highest advantage
        "zenCount": 0.0052  # Balanced system
    }
    
    advantage_per_count = count_advantages.get(system, 0.005)
    player_advantage = base_edge + (true_count * advantage_per_count)
    
    return player_advantage

def calculate_kelly_bet(bankroll: float, true_count: float, edge: float, 
                       min_bet: float, max_bet: float) -> Dict[str, float]:
    """Calculate optimal bet size using Kelly criterion"""
    if edge <= 0 or true_count <= 0:
        return {"bet_amount": min_bet, "kelly_fraction": 0, "risk_level": "low"}
    
    # Kelly fraction: f = (bp - q) / b
    # where b = odds received, p = probability of winning, q = probability of losing
    # For blackjack: simplified to f = edge / variance
    
    # Blackjack variance is approximately 1.3
    variance = 1.3
    kelly_fraction = edge / variance
    
    # Apply fractional Kelly for risk management (typically 25-50% of full Kelly)
    conservative_kelly = kelly_fraction * 0.25
    
    bet_amount = bankroll * conservative_kelly
    bet_amount = max(min_bet, min(bet_amount, max_bet))
    
    risk_level = "low" if kelly_fraction < 0.02 else "medium" if kelly_fraction < 0.05 else "high"
    
    return {
        "bet_amount": round(bet_amount, 2),
        "kelly_fraction": round(kelly_fraction, 4),
        "conservative_fraction": round(conservative_kelly, 4),
        "risk_level": risk_level
    }

def calculate_advanced_probabilities(player_cards: List[str], dealer_card: str, 
                                   cards_seen: List[str], decks: float) -> Dict[str, float]:
    """Advanced probability calculation"""
    # Calculate remaining cards
    total_cards_per_deck = {"A": 4, "2": 4, "3": 4, "4": 4, "5": 4, "6": 4,
                           "7": 4, "8": 4, "9": 4, "10": 4, "J": 4, "Q": 4, "K": 4}
    
    remaining_cards = {}
    for card, count in total_cards_per_deck.items():
        remaining_cards[card] = count * decks
    
    # Subtract seen cards
    for card in cards_seen + player_cards + [dealer_card]:
        if card in remaining_cards and remaining_cards[card] > 0:
            remaining_cards[card] -= 1
    
    total_remaining = sum(remaining_cards.values())
    if total_remaining == 0:
        return {"win": 0.33, "push": 0.08, "lose": 0.59}
    
    # Calculate player hand value
    player_value = sum(min(10, int(card) if card.isdigit() else (11 if card == 'A' else 10)) 
                      for card in player_cards)
    
    # Simplified probability calculation
    dealer_bust_prob = calculate_dealer_bust_probability(
        int(dealer_card) if dealer_card.isdigit() else (11 if dealer_card == 'A' else 10),
        remaining_cards, total_remaining
    )
    
    win_prob = calculate_win_probability_detailed(player_value, 
        int(dealer_card) if dealer_card.isdigit() else (11 if dealer_card == 'A' else 10),
        remaining_cards, total_remaining
    )
    
    return {
        "win": win_prob,
        "push": 0.08,  # Approximate push probability
        "lose": 1.0 - win_prob - 0.08,
        "dealer_bust": dealer_bust_prob
    }

def calculate_bust_probability(hand_value: int, remaining_cards: Dict[str, int], 
                             total_remaining: int) -> float:
    """Calculate bust probability for a hand"""
    if hand_value >= 21 or total_remaining == 0:
        return 0.0 if hand_value == 21 else 1.0 if hand_value > 21 else 0.0
    
    bust_cards = 0
    for card, count in remaining_cards.items():
        card_value = min(10, int(card) if card.isdigit() else (11 if card == 'A' else 10))
        if hand_value + card_value > 21:
            bust_cards += count
    
    return bust_cards / total_remaining

def calculate_dealer_bust_probability(dealer_upcard: int, remaining_cards: Dict[str, int], 
                                    total_remaining: int) -> float:
    """Calculate dealer bust probability based on upcard"""
    # Simplified dealer bust probabilities based on upcard
    bust_probabilities = {
        2: 0.35, 3: 0.37, 4: 0.40, 5: 0.42, 6: 0.42,
        7: 0.26, 8: 0.24, 9: 0.23, 10: 0.21, 11: 0.17  # 11 represents Ace
    }
    
    base_prob = bust_probabilities.get(dealer_upcard, 0.25)
    
    # Adjust based on remaining high cards
    high_cards = sum(remaining_cards.get(card, 0) for card in ['10', 'J', 'Q', 'K', 'A'])
    high_card_ratio = high_cards / max(total_remaining, 1)
    
    # More high cards increase dealer bust probability
    adjustment = (high_card_ratio - 0.38) * 0.1  # 0.38 is normal high card ratio
    
    return max(0.1, min(0.6, base_prob + adjustment))

def calculate_win_probability_detailed(player_total: int, dealer_upcard: int, 
                                     remaining_cards: Dict[str, int], total_remaining: int) -> float:
    """Detailed win probability calculation"""
    if player_total > 21:
        return 0.0
    if player_total == 21:
        return 0.85  # High probability but not guaranteed
    
    # Base win probabilities against dealer upcard
    win_matrix = {
        2: {17: 0.40, 18: 0.48, 19: 0.56, 20: 0.64, 21: 0.85},
        3: {17: 0.37, 18: 0.44, 19: 0.52, 20: 0.61, 21: 0.85},
        4: {17: 0.34, 18: 0.40, 19: 0.48, 20: 0.58, 21: 0.85},
        5: {17: 0.31, 18: 0.37, 19: 0.45, 20: 0.55, 21: 0.85},
        6: {17: 0.28, 18: 0.34, 19: 0.42, 20: 0.52, 21: 0.85},
        7: {17: 0.26, 18: 0.35, 19: 0.43, 20: 0.52, 21: 0.85},
        8: {17: 0.24, 18: 0.33, 19: 0.41, 20: 0.50, 21: 0.85},
        9: {17: 0.23, 18: 0.31, 19: 0.39, 20: 0.48, 21: 0.85},
        10: {17: 0.21, 18: 0.29, 19: 0.37, 20: 0.46, 21: 0.85},
        11: {17: 0.17, 18: 0.25, 19: 0.33, 20: 0.42, 21: 0.85}  # Ace
    }
    
    base_prob = win_matrix.get(dealer_upcard, {}).get(player_total, 0.3)
    
    # Adjust for remaining card composition
    high_cards = sum(remaining_cards.get(card, 0) for card in ['10', 'J', 'Q', 'K', 'A'])
    high_card_ratio = high_cards / max(total_remaining, 1)
    
    # More high cards favor dealer bust, helping player
    adjustment = (high_card_ratio - 0.38) * 0.05
    
    return max(0.1, min(0.9, base_prob + adjustment))

@app.post("/analyze")
async def analyze_cards(data: CardInput):
    if not data.cards:
        raise HTTPException(status_code=400, detail="No cards provided")
    
    # Advanced analysis
    running_count = calculate_running_count(data.cards, data.counting_system)
    remaining_cards = data.decks * 52 - len(data.cards)
    remaining_decks = max(remaining_cards / 52, 0.5)
    true_count = calculate_true_count(running_count, remaining_decks)
    
    # Deck penetration
    penetration = calculate_deck_penetration(len(data.cards), data.decks)
    
    # Card distribution
    card_distribution = calculate_card_distribution(data.cards)
    
    # Expected value
    expected_value = calculate_expected_value(true_count, data.counting_system)
    
    # Advanced probabilities
    advanced_probs = calculate_advanced_probabilities(
        data.cards[:2] if len(data.cards) >= 2 else data.cards,
        data.dealer_card,
        data.cards,
        data.decks
    )
    
    return {
        "counting_analysis": {
            "system": data.counting_system,
            "running_count": running_count,
            "true_count": true_count,
            "expected_value": expected_value,
            "deck_penetration": penetration
        },
        "statistics": {
            "remaining_cards": int(remaining_cards),
            "remaining_decks": float(remaining_decks),
            "card_distribution": card_distribution,
            "probabilities": advanced_probs
        },
        "recommendations": {
            "bet_recommendation": "increase" if true_count > 1 else "decrease" if true_count < -1 else "maintain",
            "play_recommendation": get_play_recommendation(true_count, expected_value),
            "risk_level": "high" if true_count > 2 else "medium" if true_count > 0 else "low"
        }
    }

@app.post("/bankroll")
async def calculate_bankroll_management(data: BankrollRequest):
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
async def get_optimal_strategy(data: StrategyRequest):
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
    """Calculate Risk of Ruin"""
    if edge <= 0:
        return 1.0
    
    # Simplified RoR formula for blackjack
    variance = 1.3
    units = bankroll / bet_size
    
    # RoR = exp(-2 * edge * units / variance)
    ror = math.exp(-2 * edge * units / variance)
    return min(1.0, max(0.0, ror))

def calculate_sessions_to_double(edge: float, bet_size: float) -> int:
    """Estimate number of sessions to double"""
    if edge <= 0:
        return float('inf')
    
    # Simplified estimate
    hands_per_session = 100
    expected_win_per_hand = edge * bet_size
    expected_win_per_session = expected_win_per_hand * hands_per_session
    
    if expected_win_per_session <= 0:
        return float('inf')
    
    return int(bet_size / expected_win_per_session)

@app.get("/", response_class=HTMLResponse)
async def root():
    template_path = os.path.join(os.path.dirname(__file__), "..", "templates", "index.html")
    with open(template_path, "r", encoding="utf-8") as f:
        return f.read()

if __name__ == "__main__":
    import uvicorn
    import sys
    import os
    
    # Add parent directory to path for config import
    sys.path.append(os.path.join(os.path.dirname(__file__), '../..'))
    from config import API_PORT, SERVER_HOST
    
    uvicorn.run(app, host=SERVER_HOST, port=API_PORT)