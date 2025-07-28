"""
Request validation middleware for the Blackjack API.

This module provides request validation utilities and middleware for the Blackjack API.
It ensures that incoming requests contain valid data before they reach the route handlers.
"""
from __future__ import annotations

import logging
from typing import Any, Dict, List, Optional, Type, TypeVar, cast
from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
from pydantic import (
    BaseModel,
    field_validator,
    model_validator,
    FieldValidationInfo,
    ValidationError,
)

# Import validation utilities
from ..utils.validation import (
    validate_card,
    validate_decks,
    validate_counting_system,
    validate_penetration,
    # validate_true_count,
    validate_bet_limits,
    VALID_CARDS,
    VALID_COUNTING_SYSTEMS,
    # VALID_DEALER_ACTIONS
)

# Type variable for generic type hints
T = TypeVar("T", bound="BaseModel")


class BlackjackRequest(BaseModel):
    """Base model for Blackjack API requests with common validation."""

    cards: List[str] = []
    dealer_card: Optional[str] = None
    decks: int = 6
    counting_system: str = "hiLo"
    penetration: float = 0.75
    true_count: float = 0.0
    bankroll: Optional[float] = None
    min_bet: Optional[float] = None
    max_bet: Optional[float] = None

    @field_validator("cards")
    @classmethod
    def validate_cards(cls, cards: List[str]) -> List[str]:
        """Validate each card in the list."""
        if not isinstance(cards, list):
            raise ValueError("Cards must be a list")
        return [validate_card(card) for card in cards]

    @field_validator("dealer_card")
    @classmethod
    def validate_dealer_card(cls, v: Optional[str]) -> Optional[str]:
        """Validate the dealer's up card."""
        if v is None:
            return None
        return validate_card(v)

    @field_validator("decks")
    @classmethod
    def validate_decks(cls, v: int) -> int:
        """Validate the number of decks."""
        return validate_decks(v)

    @field_validator("counting_system")
    @classmethod
    def validate_counting_system(cls, v: str) -> str:
        """Validate the counting system."""
        return validate_counting_system(v)

    @field_validator("penetration")
    @classmethod
    def validate_penetration(cls, v: float) -> float:
        """Validate deck penetration percentage."""
        return validate_penetration(v)

    @field_validator("true_count")
    @classmethod
    def validate_true_count(cls, v: float) -> float:
        """Validate the true count value."""
        return validate_true_count(v)

    @field_validator("min_bet")
    @classmethod
    def validate_min_bet(cls, v: Optional[float]) -> Optional[float]:
        """Validate that min_bet is positive if provided.

        Note: The actual validation of min_bet against max_bet is done in validate_bet_limits.
        """
        if v is not None and v <= 0:
            raise ValueError("min_bet must be greater than 0")
        return v

    @model_validator(mode="after")
    def validate_bet_limits(self) -> "BlackjackRequest":
        """Validate that max_bet is greater than min_bet if both are provided."""
        if self.max_bet is None:
            return self

        # Use the validation utility
        validate_bet_limits(self.max_bet, self.min_bet)
        return self

    @field_validator("bankroll")
    @classmethod
    def validate_bankroll(cls, v: Optional[float]) -> Optional[float]:
        """Validate bankroll amount."""
        if v is not None and v < 0:
            raise ValueError(f"Bankroll must be a positive number, got {v}")
        return v


def validate_request_data(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Validate request data using Pydantic model.

    Args:
        data: Dictionary containing the request data with string keys and any values

    Returns:
        Dict[str, Any]: Validated and normalized request data with proper types

    Raises:
        HTTPException: If validation fails with status code 422 and error details

    Example:
        >>> data = {"cards": ["A", "K"], "decks": "6"}
        >>> validate_request_data(data)
        {"cards": ["A", "K"], "decks": 6.0, ...}
    """
    try:
        # Convert string values to appropriate types
        normalized_data = {}
        for key, value in data.items():
            if key in {
                "decks",
                "min_bet",
                "max_bet",
                "bankroll",
                "penetration",
                "true_count",
            }:
                try:
                    normalized_data[key] = float(value)
                except (ValueError, TypeError) as e:
                    raise HTTPException(
                        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                        detail=f"Invalid value for {key}: {value}. Must be a number.",
                    )
            elif key == "cards":
                if isinstance(value, str):
                    normalized_data[key] = [c.strip().upper() for c in value.split(",")]
                else:
                    normalized_data[key] = value
            else:
                normalized_data[key] = value

        # Validate using Pydantic model
        return BlackjackRequest(**normalized_data).dict(exclude_unset=True)
    except ValidationError as e:
        errors = []
        for error in e.errors():
            field = ".".join(str(loc) for loc in error["loc"])
            msg = error["msg"]
            errors.append(f"{field}: {msg}")

        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={"message": "Validation error", "errors": errors},
        )


async def request_validation_middleware(
    request: Request, call_next: Callable[[Request], Awaitable[Any]]
) -> Any:
    """
    Middleware to validate incoming requests.

    This middleware validates both POST and GET requests, normalizes the data,
    and attaches the validated data to the request state for use in route handlers.

    Args:
        request: The incoming FastAPI request
        call_next: Callable to pass the request to the next middleware or route handler

    Returns:
        Response: The response from the next middleware or route handler

    Raises:
        HTTPException: If request validation fails with status code 400 or 422
    """
    # Skip validation for static files and docs
    if any(
        request.url.path.startswith(p)
        for p in ("/static", "/docs", "/redoc", "/openapi.json")
    ):
        return await call_next(request)

    try:
        request_data = {}

        # For POST requests, validate the JSON body
        if request.method == "POST":
            try:
                json_data = await request.json()
                if not isinstance(json_data, dict):
                    raise ValueError("Request body must be a JSON object")
                request_data.update(json_data)
            except ValueError as e:
                return JSONResponse(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    content={"message": "Invalid request body", "detail": str(e)},
                )

        # For GET requests, use query parameters
        elif request.method == "GET":
            request_data.update(dict(request.query_params))

        # Validate and normalize the request data
        if request_data:
            try:
                validated_data = validate_request_data(request_data)
                # Store validated data in request state for use in route handlers
                request.state.validated_data = validated_data
            except HTTPException as e:
                # Re-raise the exception to be handled by FastAPI's exception handlers
                return JSONResponse(
                    status_code=e.status_code,
                    content=e.detail
                    if isinstance(e.detail, dict)
                    else {"detail": str(e.detail)},
                )

        return await call_next(request)

    except HTTPException as e:
        # Handle HTTP exceptions with proper error formatting
        return JSONResponse(
            status_code=e.status_code,
            content={
                "message": "Validation error",
                "detail": str(e.detail) if hasattr(e, "detail") else str(e),
            },
        )
    except Exception as e:
        # Log unexpected errors
        logger.error(f"Unexpected error in request validation: {str(e)}", exc_info=True)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "message": "Internal server error",
                "detail": "An unexpected error occurred while processing your request",
            },
        )
