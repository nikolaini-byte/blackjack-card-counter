"""
Centralized error messages for the Blackjack API.

This module contains all error messages used throughout the application,
ensuring consistency and making it easier to manage and update messages.
"""
from typing import Dict, Any, Optional

class ErrorMessages:
    """Container class for all error messages in the application."""
    
    # Validation Errors
    INVALID_CARD = "Invalid card value: {card}. Must be one of: {valid_cards}"
    INVALID_DECK_COUNT = "Invalid number of decks: {deck_count}. Must be between {min_decks} and {max_decks}."
    INVALID_COUNTING_SYSTEM = "Invalid counting system: {system}. Must be one of: {valid_systems}"
    INVALID_PENETRATION = "Invalid penetration: {penetration}. Must be between 0 and 1."
    INVALID_TRUE_COUNT = "True count must be between {min_count} and {max_count}, got {value}"
    INVALID_BANKROLL = "Bankroll must be a positive number, got {value}"
    INVALID_BET = "{bet_type} must be greater than 0"
    INVALID_BET_RANGE = "max_bet must be greater than min_bet"
    
    # Request Validation
    INVALID_NUMERIC_VALUE = "Invalid value for {field}: {value}. Must be a number."
    VALIDATION_ERROR = "Validation error"
    
    # Authentication & Authorization
    UNAUTHORIZED = "Not authenticated"
    FORBIDDEN = "Not authorized to access this resource"
    INVALID_CREDENTIALS = "Invalid credentials"
    
    # Generic Errors
    INTERNAL_SERVER_ERROR = "An unexpected error occurred"
    NOT_FOUND = "The requested resource was not found"
    RATE_LIMIT_EXCEEDED = "Rate limit exceeded. Please try again later."
    
    # Request/Response
    MISSING_REQUIRED_FIELD = "Missing required field: {field}"
    INVALID_REQUEST_BODY = "Invalid request body"
    
    @classmethod
    def format(cls, message: str, **kwargs: Any) -> str:
        """Format a message with the given keyword arguments.
        
        Args:
            message: The message template string
            **kwargs: Keyword arguments to format into the message
            
        Returns:
            str: The formatted message
        """
        return message.format(**kwargs)
        
    @classmethod
    def validation_error(
        cls, 
        message: str, 
        field: Optional[str] = None, 
        **kwargs: Any
    ) -> Dict[str, Any]:
        """Create a validation error response.
        
        Args:
            message: The error message template
            field: The field that caused the error (if any)
            **kwargs: Additional keyword arguments for message formatting
            
        Returns:
            Dict[str, Any]: Formatted error response
        """
        error = {
            "message": cls.format(message, **kwargs),
            "code": "ValidationError",
            "status_code": 422
        }
        
        if field:
            error["field"] = field
            
        return error
        
    @classmethod
    def not_found_error(
        cls, 
        resource: str, 
        identifier: Any,
        **kwargs: Any
    ) -> Dict[str, Any]:
        """Create a not found error response.
        
        Args:
            resource: The type of resource that was not found
            identifier: The identifier that was used to look up the resource
            **kwargs: Additional keyword arguments for message formatting
            
        Returns:
            Dict[str, Any]: Formatted error response
        """
        return {
            "message": f"{resource} not found with identifier: {identifier}",
            "code": "NotFound",
            "status_code": 404,
            "details": {
                "resource": resource,
                "identifier": identifier,
                **kwargs
            }
        }
