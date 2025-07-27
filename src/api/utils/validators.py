"""
Centralized validation utilities for the Blackjack API.

This module provides reusable validation functions and decorators to ensure
consistent validation logic across the application. It builds on top of the
error handling system to provide detailed error messages and context.
"""
from __future__ import annotations
from functools import wraps
from typing import Any, Callable, Dict, Optional, TypeVar, Union, cast, TYPE_CHECKING

from fastapi import HTTPException, status, Request
from pydantic import BaseModel, ValidationError

# Import APIException at the top level to ensure it's available throughout the module
from ..middleware.exceptions import APIException

# Lazy imports to avoid circular dependencies
if TYPE_CHECKING:
    pass  # APIException is now imported at the top level

# Type variable for generic function typing
F = TypeVar('F', bound=Callable[..., Any])

def validate_with_schema(
    schema: type[BaseModel],
    error_message: str = "Invalid request data",
    status_code: int = status.HTTP_422_UNPROCESSABLE_ENTITY,
) -> Callable[[F], F]:
    # Lazy import to avoid circular dependency
    from ..middleware.exceptions import APIException
    """
    Decorator to validate request data against a Pydantic schema.
    
    Args:
        schema: The Pydantic model to validate against
        error_message: Custom error message for validation failures
        status_code: HTTP status code for validation errors
        
    Returns:
        Decorated function with automatic request validation
        
    Example:
        @validate_with_schema(CreateUserSchema)
        async def create_user(data: dict):
            # data is guaranteed to be valid here
            pass
    """
    def decorator(func: F) -> F:
        @wraps(func)
        async def wrapper(*args: Any, **kwargs: Any) -> Any:
            try:
                # Find the request data in the function arguments
                request_data = kwargs.get('data')
                if request_data is None:
                    for arg in args:
                        if isinstance(arg, dict):
                            request_data = arg
                            break
                
                if request_data is None:
                    raise APIException(
                        message="No data provided for validation",
                        status_code=status.HTTP_400_BAD_REQUEST,
                        error_code="validation_error",
                    )
                
                # Validate the data against the schema
                validated_data = schema(**request_data)
                
                # Replace the data in kwargs with the validated data
                if 'data' in kwargs:
                    kwargs['data'] = validated_data
                else:
                    # Find and replace the first dict argument
                    new_args = []
                    replaced = False
                    for arg in args:
                        if not replaced and isinstance(arg, dict):
                            new_args.append(validated_data)
                            replaced = True
                        else:
                            new_args.append(arg)
                    args = tuple(new_args)
                
                return await func(*args, **kwargs)
                
            except ValidationError as e:
                # Convert Pydantic validation errors to our format
                errors = []
                for error in e.errors():
                    field = ".".join(str(loc) for loc in error['loc'] if loc != 'body')
                    errors.append({
                        'field': field or 'body',
                        'message': error['msg'],
                        'type': error['type'],
                        'input': error.get('input'),
                        'ctx': error.get('ctx'),
                    })
                
                raise APIException(
                    message=error_message,
                    status_code=status_code,
                    error_code="validation_error",
                    details={'validation_errors': errors},
                )
                
            except Exception as e:
                # Re-raise API exceptions as-is
                if isinstance(e, APIException):
                    raise
                # Convert other exceptions to API exceptions
                raise APIException(
                    message=str(e) or "An unexpected error occurred during validation",
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    error_code="validation_error",
                ) from e
                
        return cast(F, wrapper)
    return decorator

def validate_range(
    value: Any,
    min_val: Optional[float] = None,
    max_val: Optional[float] = None,
    field_name: str = "value",
    value_type: str = "value",
) -> float:
    # Lazy import to avoid circular dependency
    from ..middleware.exceptions import APIException
    """
    Validate that a numeric value is within the specified range.
    
    Args:
        value: The value to validate
        min_val: Minimum allowed value (inclusive)
        max_val: Maximum allowed value (inclusive)
        field_name: Name of the field for error messages
        value_type: Type of the value for error messages
        
    Returns:
        The validated value as a float
        
    Raises:
        APIException: If the value is outside the valid range
    """
    try:
        num = float(value)
    except (ValueError, TypeError) as e:
        raise APIException(
            message=f"{field_name} must be a number, got {value!r}",
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            error_code="invalid_type",
            field=field_name,
            value=value,
            expected=f"a number between {min_val} and {max_val}" if min_val is not None and max_val is not None else "a number",
        ) from e
    
    if min_val is not None and num < min_val:
        raise APIException(
            message=f"{value_type} must be at least {min_val}, got {num}",
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            error_code="value_too_small",
            field=field_name,
            value=num,
            min=min_val,
        )
        
    if max_val is not None and num > max_val:
        raise APIException(
            message=f"{value_type} must be at most {max_val}, got {num}",
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            error_code="value_too_large",
            field=field_name,
            value=num,
            max=max_val,
        )
    
    return num

def validate_enum(
    value: Any,
    valid_values: list[Any],
    field_name: str,
    value_type: str = "value",
    case_sensitive: bool = True,
) -> str:
    # Lazy import to avoid circular dependency
    from ..middleware.exceptions import APIException
    """
    Validate that a value is one of the allowed values.
    
    Args:
        value: The value to validate
        valid_values: List of allowed values
        field_name: Name of the field for error messages
        value_type: Type of the value for error messages
        case_sensitive: Whether the comparison should be case-sensitive
        
    Returns:
        The validated value (original from valid_values if case-insensitive match)
        
    Raises:
        APIException: If the value is not in the allowed values
    """
    if not valid_values:
        raise ValueError("valid_values cannot be empty")
    
    if value is None:
        return None
        
    str_value = str(value)
    
    if case_sensitive:
        if str_value in [str(v) for v in valid_values]:
            return str_value
    else:
        # Find the original value with case-insensitive comparison
        for valid_value in valid_values:
            if str(valid_value).lower() == str_value.lower():
                return str(valid_value)  # Return the original value with correct case
    
    # If we get here, the value is not valid
    raise APIException(
        message=f"Invalid {value_type}: {value!r}. Must be one of: {', '.join(map(repr, valid_values))}",
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        error_code="invalid_enum_value",
        field=field_name,
        value=value,
        expected=f"one of {', '.join(map(repr, valid_values))}",
    )

class ValidationResult:
    """Represents the result of a validation operation."""
    
    def __init__(self, is_valid: bool = True, errors: Optional[list[dict]] = None):
        self.is_valid = is_valid
        self.errors = errors or []
    
    def add_error(self, field: str, message: str, code: str = "invalid", **details: Any) -> None:
        """Add an error to the validation result."""
        self.is_valid = False
        self.errors.append({
            'field': field,
            'message': message,
            'code': code,
            **details,
        })
    
    def raise_if_invalid(self, status_code: int = status.HTTP_422_UNPROCESSABLE_ENTITY) -> None:
        """Raise an APIException if the validation failed."""
        if not self.is_valid:
            raise APIException(
                message="Validation failed",
                status_code=status_code,
                error_code="validation_error",
                details={'errors': self.errors},
            )
    
    def to_dict(self) -> dict:
        """Convert the validation result to a dictionary."""
        return {
            'is_valid': self.is_valid,
            'errors': self.errors,
        }
