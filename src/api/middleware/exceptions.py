"""
Base exceptions and error handling utilities for the Blackjack API.

This module defines the base exception classes and utilities used throughout the application
for consistent error handling and reporting.
"""
from typing import Any, Dict, Optional
from fastapi import status, Request
from .request_utils import get_request_context

class APIException(Exception):
    """Base exception class for all API exceptions.
    
    Attributes:
        status_code (int): HTTP status code for the error response
        error_code (str): Application-specific error code
        message (str): Human-readable error message
        details (Dict[str, Any]): Additional error details for debugging
        request (Optional[Request]): The request that caused the error
        context (Dict[str, Any]): Additional context for error reporting
    """
    status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR
    error_code: str = "internal_server_error"
    message: str = "An unexpected error occurred"
    
    def __init__(
        self,
        message: Optional[str] = None,
        status_code: Optional[int] = None,
        error_code: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
        field: Optional[str] = None,
        value: Any = None,
        expected: Optional[str] = None,
        request: Optional[Request] = None,
        **context: Any,
    ):
        self.status_code = status_code or self.status_code
        self.error_code = error_code or self.error_code
        self.message = message or self.message
        self.details = details or {}
        self.request = request
        self.context = context or {}
        
        # Add standard fields if provided
        if field is not None:
            self.details["field"] = field
        if value is not None:
            self.details["value"] = value
        if expected is not None:
            self.details["expected"] = expected
            
        # Add request context if available
        if request:
            self.details["request_id"] = self.context.get("request_id") or get_request_context(request).get("request_id")
            
        super().__init__(self.message)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert the exception to a dictionary for JSON response."""
        return {
            "error": {
                "code": self.error_code,
                "message": self.message,
                "status_code": self.status_code,
                "details": self.details,
            }
        }

class BlackjackError(APIException):
    """Base exception for all Blackjack API errors."""
    status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
    error_code = "blackjack_error"
    message = "An unexpected error occurred in the Blackjack API"


class ValidationError(BlackjackError):
    """Raised when input data fails validation.
    
    Attributes:
        message: Human-readable error message
        field: Name of the field that failed validation (if applicable)
        value: The invalid value that caused the validation to fail
        expected: Description of the expected value or format
    """
    status_code = status.HTTP_400_BAD_REQUEST
    error_code = "validation_error"
    message = "Validation error occurred"
    
    def __init__(
        self, 
        message: Optional[str] = None, 
        field: Optional[str] = None, 
        value: Any = None, 
        expected: Optional[str] = None,
        **kwargs
    ):
        details = kwargs.get('details', {})
        if field:
            details["field"] = field
        if value is not None:
            details["value"] = value
        if expected:
            details["expected"] = expected
            
        super().__init__(
            message=message or self.message,
            details=details,
            **{k: v for k, v in kwargs.items() if k != 'details'}
        )

# Import validation constants from constants module
from ..constants import VALID_CARDS, VALID_COUNTING_SYSTEMS

class InvalidCardError(BlackjackError):
    """Raised when an invalid card is provided."""
    status_code = status.HTTP_422_UNPROCESSABLE_ENTITY
    error_code = "invalid_card"
    
    def __init__(self, card: str):
        message = f"Invalid card: {card}. Valid cards are: {', '.join(sorted(VALID_CARDS))}"
        details = {"invalid_card": card, "valid_cards": sorted(list(VALID_CARDS))}
        super().__init__(message=message, details=details)

class InvalidDeckCountError(BlackjackError):
    """Raised when an invalid number of decks is provided."""
    status_code = status.HTTP_422_UNPROCESSABLE_ENTITY
    error_code = "invalid_deck_count"
    
    def __init__(self, deck_count: float, min_decks: int, max_decks: int):
        message = f"Invalid deck count: {deck_count}. Must be between {min_decks} and {max_decks} decks."
        details = {
            "invalid_deck_count": deck_count,
            "min_decks": min_decks,
            "max_decks": max_decks
        }
        super().__init__(message=message, details=details)

class InvalidCountingSystemError(BlackjackError):
    """Raised when an invalid counting system is provided."""
    status_code = status.HTTP_422_UNPROCESSABLE_ENTITY
    error_code = "invalid_counting_system"
    
    def __init__(self, system: str):
        message = f"Invalid counting system: {system}. Valid systems are: {', '.join(sorted(VALID_COUNTING_SYSTEMS))}"
        details = {"invalid_system": system, "valid_systems": sorted(list(VALID_COUNTING_SYSTEMS))}
        super().__init__(message=message, details=details)
