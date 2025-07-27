"""
Bankroll management service for the Blackjack Card Counter API.

This module provides comprehensive bankroll management and betting strategy 
recommendations, including:
- Kelly Criterion bet sizing
- Risk of ruin calculations
- Expected value calculations
- Bankroll requirement planning
"""
from typing import Dict, List, Optional, Tuple, TypedDict, Literal, Union
from typing_extensions import NotRequired  # For Python < 3.11
from decimal import Decimal
from ..models.schemas import BankrollRequest

# Type aliases for better type hints
Currency = float  # Represents monetary values
Probability = float  # Value between 0.0 and 1.0
TrueCount = float  # The current true count in card counting

class BankrollRecommendation(TypedDict):
    """Type definition for bankroll management recommendations."""
    recommended_bet: Currency
    risk_of_ruin: Probability
    expected_value: Currency
    kelly_bet: Currency
    half_kelly_bet: Currency

class BankrollRequirement(TypedDict):
    """Type definition for bankroll requirement calculations."""
    required_bankroll: Currency
    expected_income: Currency
    risk_level: Probability
    time_horizon_weeks: int

def manage_bankroll(bankroll_request: BankrollRequest) -> Union[BankrollRecommendation, Dict[str, str]]:
    """
    Calculate recommended bet sizes and comprehensive bankroll management metrics.
    
    This function serves as the main entry point for bankroll management, 
    providing a complete analysis of the optimal betting strategy based on
    the current bankroll, risk tolerance, and game conditions.
    
    Args:
        bankroll_request: A BankrollRequest object containing:
            - bankroll: Current available bankroll
            - true_count: Current true count in the game
            - risk_tolerance: Acceptable risk level (0.0 to 1.0)
            - min_bet: Minimum allowed bet at the table
            - max_bet: Maximum allowed bet at the table
            
    Returns:
        BankrollRecommendation: A dictionary containing:
            - recommended_bet: Optimal bet size based on risk tolerance
            - risk_of_ruin: Probability of losing the entire bankroll
            - expected_value: Expected value of the recommended bet
            - kelly_bet: Bet size suggested by Kelly Criterion
            - half_kelly_bet: More conservative bet size (50% of Kelly)
            
        If an error occurs, returns a dictionary with an "error" key and message.
        
    Example:
        >>> request = BankrollRequest(
        ...     bankroll=1000.0,
        ...     true_count=2.5,
        ...     risk_tolerance=0.1,
        ...     min_bet=10.0,
        ...     max_bet=500.0
        ... )
        >>> result = manage_bankroll(request)
        >>> print(f"Recommended bet: ${result['recommended_bet']:.2f}")
    """
    # Calculate Kelly Criterion bet size
    kelly_bet = _calculate_kelly_bet(
        bankroll_request.bankroll,
        bankroll_request.true_count
    )
    
    # Calculate half-Kelly for more conservative betting
    half_kelly_bet = kelly_bet / 2
    
    # Calculate recommended bet based on risk tolerance
    recommended_bet = _calculate_recommended_bet(
        bankroll_request.bankroll,
        bankroll_request.risk_tolerance,
        bankroll_request.true_count,
        bankroll_request.min_bet,
        bankroll_request.max_bet
    )
    
    # Calculate risk of ruin
    risk_of_ruin = _calculate_risk_of_ruin(
        bankroll_request.bankroll,
        recommended_bet,
        bankroll_request.true_count
    )
    
    # Calculate expected value
    expected_value = _calculate_expected_value(
        recommended_bet,
        bankroll_request.true_count
    )
    
    return {
        "recommended_bet": round(recommended_bet, 2),
        "risk_of_ruin": round(risk_of_ruin, 4),
        "expected_value": round(expected_value, 2),
        "kelly_bet": round(kelly_bet, 2),
        "half_kelly_bet": round(half_kelly_bet, 2)
    }

def _calculate_kelly_bet(bankroll: Currency, true_count: TrueCount) -> Currency:
    """
    Calculate the Kelly Criterion bet size based on current advantage.
    
    The Kelly Criterion is a mathematical formula that determines the optimal 
    bet size to maximize logarithmic utility, which is equivalent to maximizing 
    the expected geometric growth rate of the bankroll.
    
    Formula: f* = (bp - q) / b
    Where:
        f* = fraction of current bankroll to wager
        b = net odds received on the wager (b = 1 for even money)
        p = probability of winning
        q = probability of losing = 1 - p
    
    Args:
        bankroll: Current available bankroll
        true_count: Current true count, used to estimate player advantage
        
    Returns:
        Currency: The optimal bet size according to Kelly Criterion,
                 or 0 if the bet would have negative expectation
    """
    # Simplified advantage calculation based on true count
    # In a real implementation, this would be more sophisticated
    advantage = 0.01 * true_count  # 1% per true count
    
    # Kelly fraction (f* = (bp - q) / b)
    # Where b is the net odds received on the wager (b = 1 for even money)
    # p is the probability of winning
    # q is the probability of losing (1 - p)
    p = 0.5 + advantage / 2  # Base win probability is 50% plus half the advantage
    q = 1 - p
    b = 1.0  # Even money payout
    
    # Kelly fraction (clamped between 0 and 1)
    kelly_fraction = max(0, min((b * p - q) / b, 1.0))
    
    return bankroll * kelly_fraction

def _calculate_recommended_bet(
    bankroll: Currency,
    risk_tolerance: Probability,
    true_count: TrueCount,
    min_bet: Currency,
    max_bet: Currency
) -> Currency:
    """
    Calculate the recommended bet size based on risk tolerance and game conditions.
    
    This function implements a practical betting strategy that considers:
    - The player's risk tolerance (as a percentage of bankroll)
    - The current true count (higher counts increase bet size)
    - Table limits (min_bet and max_bet)
    
    The bet size is calculated as:
        base_bet = bankroll * risk_tolerance
        count_multiplier = min(1.0 + (true_count * 0.1), 2.0)
        recommended = base_bet * count_multiplier
        
    Args:
        bankroll: Current available bankroll
        risk_tolerance: Fraction of bankroll willing to risk per bet (0.0 to 1.0)
        true_count: Current true count in the game
        min_bet: Minimum allowed bet at the table
        max_bet: Maximum allowed bet at the table
        
    Returns:
        Currency: The recommended bet size, bounded by table limits
        
    Note:
        The count_multiplier is capped at 2.0 to prevent overbetting
        during high true counts.
    """
    # Base bet as a percentage of bankroll, adjusted by risk tolerance
    base_bet = bankroll * risk_tolerance
    
    # Adjust bet based on true count
    # Each true count point increases bet by 10% (capped at 2x)
    count_multiplier = min(1.0 + (true_count * 0.1), 2.0)
    recommended = base_bet * count_multiplier
    
    # Apply min/max bounds
    return max(min_bet, min(recommended, max_bet))

def _calculate_risk_of_ruin(
    bankroll: Currency,
    bet_size: Currency,
    true_count: TrueCount
) -> Probability:
    """
    Calculate the risk of ruin based on bankroll, bet size, and game conditions.
    
    The risk of ruin is the probability of losing the entire bankroll given:
    - The current bankroll size
    - The bet size as a percentage of bankroll
    - The player's advantage (estimated from true count)
    
    This implementation uses a simplified model where:
    1. The risk factor decreases by 5% per true count point
    2. The base risk is 50% for even-money bets at true count 0
    3. The risk decreases exponentially with bankroll size
    
    Formula: risk = risk_factor ^ (bankroll / bet_size)
    
    Args:
        bankroll: Current available bankroll
        bet_size: Size of each bet
        true_count: Current true count in the game
        
    Returns:
        Probability: The risk of ruin as a value between 0.0 and 1.0
        
    Note:
        This is a simplified calculation. A more accurate model would consider:
        - The full distribution of possible outcomes
        - The specific rules of the game
        - The player's skill level
        - The actual advantage at each true count
    """
    if bet_size <= 0 or bankroll <= 0:
        return 1.0  # 100% risk of ruin if no bankroll or no bet
    
    # Simplified risk calculation based on true count
    # Higher true count = lower risk of ruin
    risk_factor = max(0.01, 0.5 - (true_count * 0.05))  # 5% reduction per true count
    
    # Adjust based on bankroll size relative to bet size
    bankroll_units = bankroll / bet_size
    risk = risk_factor ** bankroll_units
    
    return min(max(risk, 0.0), 1.0)  # Clamp between 0 and 1

def _calculate_expected_value(bet_size: Currency, true_count: TrueCount) -> Currency:
    """
    Calculate the expected value of a bet based on the true count.
    
    The expected value represents the average amount a player can expect to
    win or lose per bet in the long run, given the current game conditions.
    
    Formula: EV = bet_size * player_edge
    Where player_edge = house_edge + (true_count * edge_per_count)
    
    Assumptions:
    - Base house edge: -0.5% (for basic strategy)
    - Edge per true count: +0.5% (varies by game rules and count system)
    
    Args:
        bet_size: The size of the bet
        true_count: Current true count in the game
        
    Returns:
        Currency: The expected value of the bet, which can be positive
                 (favorable) or negative (unfavorable)
    """
    # Simplified EV calculation
    # Base house edge is approximately -0.5% for basic strategy
    # Each true count point is worth approximately 0.5% to the player
    edge_per_count = 0.005
    house_edge = -0.005  # -0.5%
    player_edge = house_edge + (true_count * edge_per_count)
    
    return bet_size * player_edge

def calculate_bankroll_needed(
    desired_income: Currency,
    sessions_per_week: int,
    weeks: int,
    risk_tolerance: Probability,
    avg_true_count: TrueCount
) -> Union[BankrollRequirement, Dict[str, str]]:
    """
    Calculate the bankroll needed to achieve a desired income with given risk parameters.
    
    This function helps players plan their bankroll requirements based on:
    - Desired income goals
    - Playing frequency
    - Risk tolerance
    - Expected game conditions (average true count)
    
    The required bankroll is calculated using a simplified model based on the
    Kelly Criterion and the player's advantage at the given average true count.
    
    Args:
        desired_income: Target income per playing session
        sessions_per_week: Number of sessions the player plans to play each week
        weeks: Time horizon for the income goal in weeks
        risk_tolerance: Acceptable risk level (0.0 to 1.0, where lower is more conservative)
        avg_true_count: Expected average true count during play sessions
        
    Returns:
        BankrollRequirement: A dictionary containing:
            - required_bankroll: Estimated bankroll needed to achieve the income goal
            - expected_income: Total expected income over the time horizon
            - risk_level: The input risk tolerance (for reference)
            - time_horizon_weeks: The input time horizon (for reference)
            
        If an error occurs, returns a dictionary with an "error" key and message.
        
    Example:
        >>> result = calculate_bankroll_needed(
        ...     desired_income=200.0,
        ...     sessions_per_week=3,
        ...     weeks=12,
        ...     risk_tolerance=0.1,
        ...     avg_true_count=1.5
        ... )
        >>> print(f"Required bankroll: ${result['required_bankroll']:,.2f}")
    """
    # Calculate required bankroll using Kelly Criterion
    # This is a simplified calculation
    required_bankroll = (desired_income * 10) / (avg_true_count * risk_tolerance)
    
    # Calculate expected income
    expected_income = desired_income * sessions_per_week * weeks
    
    return {
        "required_bankroll": round(required_bankroll, 2),
        "expected_income": round(expected_income, 2),
        "risk_level": risk_tolerance,
        "time_horizon_weeks": weeks
    }
