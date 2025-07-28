"""
Validation utilities for the Blackjack API.

This module provides a comprehensive set of validation functions for the Blackjack API,
ensuring consistent validation logic across the application. It handles validation of:
- Card values and hands
- Deck counts and penetration
- Counting systems
- Betting limits and true counts

All validation functions raise appropriate custom exceptions with descriptive error messages
that are suitable for API responses. The module follows a consistent pattern for validation
and error reporting.
"""
from typing import Any, Optional, TypeVar, cast, Union, TYPE_CHECKING
from pydantic import BaseModel

# Lazy imports to avoid circular dependencies
if TYPE_CHECKING:
    from pydantic import FieldValidationInfo
    from ..middleware.error_messages import ErrorMessages

# Import validation constants from constants module
from ..constants import VALID_CARDS, VALID_COUNTING_SYSTEMS

# Constants for validation
MIN_DECKS = 1
MAX_DECKS = 10
MIN_TRUE_COUNT = -20
MAX_TRUE_COUNT = 20

from ..middleware.error_messages import ErrorMessages
from ..middleware.exceptions import (
    BlackjackError,
    InvalidCardError,
    InvalidDeckCountError,
    InvalidCountingSystemError,
    ValidationError,
)

# ValidationError class has been moved to src.api.middleware.exceptions


def _ensure_numeric(value: Any, field_name: str) -> Union[int, float]:
    """Ensure the input is a numeric value.

    Args:
        value: The value to check
        field_name: Name of the field for error messages

    Returns:
        Union[int, float]: The validated numeric value

    Raises:
        ValidationError: If the value is not numeric
    """
    if value is None:
        raise ValidationError(
            message=f"{field_name} is required",
            field=field_name,
            value=value,
            expected="a numeric value",
        )
    try:
        return float(value) if "." in str(value) else int(value)
    except (ValueError, TypeError) as e:
        raise ValidationError(
            message=f"{field_name} must be a number, got {value!r}",
            field=field_name,
            value=value,
            expected="a number",
        ) from e


def _validate_range(
    value: float,
    min_val: float,
    max_val: float,
    field_name: str,
    value_type: str = "value",
) -> float:
    """Validate that a value is within the specified range.

    Args:
        value: The value to validate
        min_val: Minimum allowed value (inclusive)
        max_val: Maximum allowed value (inclusive)
        field_name: Name of the field for error messages
        value_type: Type of the value for error messages (e.g., 'count', 'penetration')

    Returns:
        float: The validated value

    Raises:
        ValidationError: If the value is outside the valid range
    """
    if value < min_val or value > max_val:
        error_msg = f"{field_name} must be between {min_val} and {max_val}, got {value}"
        if value_type != "value":
            error_msg = f"{value_type.capitalize()} must be between {min_val} and {max_val}, got {value}"

        raise ValidationError(
            message=error_msg,
            field=field_name,
            value=value,
            expected=f"a value between {min_val} and {max_val}",
        )
    return value


def validate_card(card: Any) -> str:
    """Validate and normalize a single card value.

    This function validates that the input is a string representing a valid card value
    and normalizes it to uppercase. Valid card values are: 2-10, J, Q, K, A.

    Args:
        card: The card value to validate (will be converted to string)

    Returns:
        str: The validated and normalized card value in uppercase

    Raises:
        InvalidCardError: If the card is not a valid card value

    Example:
        >>> validate_card('k')
        'K'
        >>> validate_card('10')
        '10'
    """
    if card is None:
        raise InvalidCardError(
            message="Card value cannot be None",
            details={"valid_cards": sorted(list(VALID_CARDS))},
        )

    try:
        card_str = str(card).strip().upper()
    except Exception as e:
        raise InvalidCardError(
            message=f"Invalid card value: {card!r}",
            details={
                "value": card,
                "valid_cards": sorted(list(VALID_CARDS)),
                "error": str(e),
            },
        ) from e

    # Special case for 10 (allow '10' or 'T')
    if card_str in ("10", "T"):
        return "10"

    # Check if it's a single character card (A, K, Q, J, or 2-9)
    if len(card_str) == 1 and card_str in VALID_CARDS:
        return card_str

    # If we get here, the card is invalid
    raise InvalidCardError(
        message=f"Invalid card value: {card_str!r}",
        details={"value": card_str, "valid_cards": sorted(list(VALID_CARDS))},
    )


def validate_decks(decks: Any) -> int:
    """Validate the number of decks in play.

    Args:
        decks: The number of decks to validate (will be converted to int)

    Returns:
        int: The validated number of decks as an integer

    Raises:
        InvalidDeckCountError: If the deck count is out of range

    Example:
        >>> validate_decks(4)
        4
        >>> validate_decks('6')
        6
    """
    try:
        decks_num = int(_ensure_numeric(decks, "decks"))
        _validate_range(decks_num, MIN_DECKS, MAX_DECKS, "number of decks")
        return decks_num
    except (ValueError, TypeError) as e:
        raise InvalidDeckCountError(decks, MIN_DECKS, MAX_DECKS) from e


def validate_counting_system(system: Any) -> str:
    """Validate the counting system name.

    Args:
        system: The counting system name to validate (will be converted to string)

    Returns:
        str: The validated counting system name in lowercase

    Raises:
        InvalidCountingSystemError: If the counting system is not recognized

    Example:
        >>> validate_counting_system('hilo')
        'hilo'
    """
    if system is None:
        raise InvalidCountingSystemError(
            system="", message="Counting system is required"
        )

    try:
        system_str = str(system).strip().lower()
    except Exception as e:
        raise InvalidCountingSystemError(
            system=str(system)[:100],  # Truncate long strings
            message=f"Invalid counting system format: {system!r}",
            details={"error": str(e)},
        ) from e

    if not system_str:
        raise InvalidCountingSystemError(
            system=system_str, message="Counting system cannot be empty"
        )

    if system_str not in VALID_COUNTING_SYSTEMS:
        raise InvalidCountingSystemError(
            system=system_str,
            valid_systems=sorted(list(VALID_COUNTING_SYSTEMS)),
            message=f"Unsupported counting system: {system_str}",
        )

    return system_str


def validate_penetration(penetration: Any) -> float:
    """Validate deck penetration percentage.

    Args:
        penetration: The penetration value to validate (0-1)

    Returns:
        float: The validated penetration value between 0 (exclusive) and 1 (inclusive)

    Raises:
        InvalidPenetrationError: If penetration is not between 0 and 1 or is invalid

    Example:
        >>> validate_penetration(0.75)
        0.75
    """
    if penetration is None:
        raise InvalidPenetrationError(
            message="Penetration value is required",
            field="penetration",
            expected="a number between 0 and 1 (exclusive)",
        )

    try:
        penetration_float = float(penetration)
    except (ValueError, TypeError) as e:
        raise InvalidPenetrationError(
            message=f"Penetration must be a number, got {penetration!r}",
            field="penetration",
            value=penetration,
            expected="a number between 0 and 1 (exclusive)",
        ) from e

    if not 0 < penetration_float <= 1:
        raise InvalidPenetrationError(
            message=f"Penetration must be between 0 (exclusive) and 1 (inclusive), got {penetration_float}",
            field="penetration",
            value=penetration_float,
            expected="a value between 0 and 1 (exclusive)",
        )

    return penetration_float


def validate_bet_limits(
    max_bet: Optional[Union[float, int, str]] = None,
    min_bet: Optional[Union[float, int, str]] = None,
) -> tuple[Optional[float], Optional[float]]:
    """Validate betting limits and their relationship.

    Args:
        max_bet: The maximum bet value (can be None, float, int, or string)
        min_bet: The minimum bet value (optional, can be None, float, int, or string)

    Returns:
        tuple[Optional[float], Optional[float]]: A tuple of (validated_min_bet, validated_max_bet)

    Raises:
        InvalidBetLimitsError: If bet limits are invalid or inconsistent

    Example:
        >>> validate_bet_limits(100, 10)
        (10.0, 100.0)
        >>> validate_bet_limits(50, None)
        (None, 50.0)
    """

    def parse_bet(bet: Any, field_name: str) -> Optional[float]:
        if bet is None:
            return None

        try:
            bet_float = float(bet)
        except (ValueError, TypeError) as e:
            raise InvalidBetLimitsError(
                message=f"{field_name} must be a non-negative number, got {bet!r}",
                field=field_name.lower().replace(" ", "_"),
                value=bet,
                expected="a non-negative number",
            ) from e

        if bet_float < 0:
            raise InvalidBetLimitsError(
                message=f"{field_name} must be non-negative, got {bet_float}",
                field=field_name.lower().replace(" ", "_"),
                value=bet_float,
                expected="a non-negative number",
            )

        if not math.isfinite(bet_float):
            raise InvalidBetLimitsError(
                message=f"{field_name} must be a finite number, got {bet_float}",
                field=field_name.lower().replace(" ", "_"),
                value=bet_float,
                expected="a finite number",
            )

        return bet_float

    validated_min = parse_bet(min_bet, "Minimum bet") if min_bet is not None else None
    validated_max = parse_bet(max_bet, "Maximum bet") if max_bet is not None else None

    # If both are provided, validate that min <= max
    if (
        validated_min is not None
        and validated_max is not None
        and validated_min > validated_max
    ):
        raise InvalidBetLimitsError(
            message=f"Minimum bet ({validated_min}) cannot be greater than maximum bet ({validated_max})",
            field="bet_limits",
            value={"min_bet": validated_min, "max_bet": validated_max},
            expected="minimum_bet <= maximum_bet",
        )
        if validated_max < validated_min:
            raise ValidationError(ErrorMessages.INVALID_BET_RANGE)

    return validated_min, validated_max
