"""
Blackjack Card Counter API

This package contains the API for the Blackjack Card Counter application.
"""

# Import models
from .models import CardInput, StrategyRequest, BankrollRequest

# Import error classes from middleware
from .middleware.error_handler import (
    BlackjackError,
    InvalidCardError,
    InvalidDeckCountError,
    InvalidCountingSystemError,
)

# Import decision engine and related functions
from .decision_engine import (
    BlackjackDecisionEngine,
    get_decision_recommendation,
    calculate_action_probabilities,
)

# Import counting systems
from .utils.counting_systems import COUNTING_SYSTEMS, get_counting_system

# Import the main FastAPI app
from .main import app

# Import counting systems from utils
from .utils.counting_systems import COUNTING_SYSTEMS

# Import utility functions
from .utils import (
    calculate_hand_value,
    calculate_advanced_probabilities,
    get_counting_system,
    calculate_running_count,
    calculate_true_count,
)

# Import services
from .services import (
    analyze_cards,
    get_strategy_recommendation,
    manage_bankroll,
    calculate_bankroll_needed,
)

__all__ = [
    # Models
    "CardInput",
    "StrategyRequest",
    "BankrollRequest",
    # Error classes
    "BlackjackError",
    "InvalidCardError",
    "InvalidDeckCountError",
    "InvalidCountingSystemError",
    # Main app
    "app",
    # Counting systems
    "COUNTING_SYSTEMS",
    # Utility functions
    "calculate_hand_value",
    "calculate_advanced_probabilities",
    "get_counting_system",
    "calculate_running_count",
    "calculate_true_count",
    # Services
    "analyze_cards",
    "get_strategy_recommendation",
    "manage_bankroll",
    "calculate_bankroll_needed",
]
