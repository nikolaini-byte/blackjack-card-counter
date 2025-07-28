"""
Error handling middleware and utilities for the Blackjack API.
"""
import logging
from typing import Any, Dict, Optional, List, Union, Tuple

from fastapi import Request, status, HTTPException
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import ValidationError

# Import error messages from error_messages.py
from .error_messages import ErrorMessages

# Import exceptions from exceptions.py
from .exceptions import (
    APIException,
    BlackjackError,
    InvalidCardError,
    InvalidDeckCountError,
    InvalidCountingSystemError,
)

# Import request utilities
from .request_utils import get_request_context

# Configure logger at module level
logger = logging.getLogger(__name__)

# Type alias for request context info
RequestContext = Dict[str, Any]

# Constants moved to validation.py
from ..utils.validation import VALID_CARDS, VALID_COUNTING_SYSTEMS

# Configure logger at module level
logger = logging.getLogger(__name__)


async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    """Handle HTTP exceptions with detailed logging.

    This handler processes standard HTTP exceptions and returns a consistent
    error response format with detailed logging for debugging.

    Args:
        request: The incoming request object
        exc: The HTTP exception that was raised

    Returns:
        JSONResponse: Formatted error response with appropriate status code and details
    """
    # Get request context for logging
    context = get_request_context(request)
    request_id = context["request_id"]

    # Prepare error details
    error_details = {
        "status_code": exc.status_code,
        "detail": str(exc.detail),
        "headers": dict(exc.headers) if hasattr(exc, "headers") else None,
        "request_id": request_id,
    }

    # Log the error with structured context
    logger.error(
        "HTTP Exception: %s - %s",
        exc.status_code,
        exc.detail,
        extra={
            "error": error_details,
            "request": {
                "method": request.method,
                "url": str(request.url),
                "client": request.client.host if request.client else None,
                "user_agent": request.headers.get("user-agent"),
                "id": request_id,
            },
        },
    )

    # Return a clean, consistent error response
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": exc.__class__.__name__.lower(),
                "message": str(exc.detail),
                "status_code": exc.status_code,
                "request_id": request_id,
                "timestamp": context["timestamp"],
            }
        },
        headers={
            "X-Request-ID": request_id,
            **dict(exc.headers if hasattr(exc, "headers") else {}),
        },
    )


async def validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    """
    Handle request validation errors with detailed logging.

    Args:
        request: The incoming request object
        exc: The validation exception that was raised

    Returns:
        JSONResponse: Formatted validation error response with status 422
    """
    # Extract validation errors in a more readable format
    errors = []
    for error in exc.errors():
        error_info = {
            "loc": error["loc"],
            "msg": error["msg"],
            "type": error["type"],
        }
        if "ctx" in error:
            error_info["context"] = error["ctx"]
        errors.append(error_info)

    # Log the validation error
    logger.warning(
        "Request Validation Error",
        extra={
            "request": {
                "method": request.method,
                "url": str(request.url),
                "client": request.client.host if request.client else None,
            },
            "validation_errors": errors,
        },
    )

    # Create a validation error response using our APIException structure
    error_response = APIException(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        error_code="validation_error",
        message=ErrorMessages.VALIDATION_ERROR,
        details={"validation_errors": errors},
    )

    # Return the error response
    return JSONResponse(
        status_code=error_response.status_code,
        content=error_response.to_dict(),
    )


async def unexpected_exception_handler(
    request: Request, exc: Exception
) -> JSONResponse:
    """Handle unexpected exceptions with detailed logging.

    This is a catch-all handler for any unhandled exceptions that occur during
    request processing. It logs the full exception details and returns a generic
    500 error to the client.

    Args:
        request: The incoming request object
        exc: The unexpected exception that was raised

    Returns:
        JSONResponse: Generic 500 error response without exposing internal details
    """
    # Get request context for logging
    context = get_request_context(request)
    request_id = context["request_id"]

    # Prepare error details for logging
    error_details = {
        "type": exc.__class__.__name__,
        "message": str(exc),
        "request_id": request_id,
        "traceback": traceback.format_exc(),
    }

    # Log the full exception with structured context
    logger.exception(
        "Unhandled exception: %s",
        str(exc),
        extra={
            "error": error_details,
            "request": {
                "method": request.method,
                "url": str(request.url),
                "client": request.client.host if request.client else None,
                "user_agent": request.headers.get("user-agent"),
                "id": request_id,
            },
        },
    )

    # Return a generic 500 error to the client with request ID for correlation
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": {
                "code": "internal_server_error",
                "message": "An unexpected error occurred",
                "status_code": status.HTTP_500_INTERNAL_SERVER_ERROR,
                "request_id": request_id,
                "timestamp": context["timestamp"],
            }
        },
        headers={"X-Request-ID": request_id},
    )


def register_error_handlers(app) -> None:
    """Register all error handlers with the FastAPI app.

    This function registers the following error handlers:
    - HTTPException: For standard HTTP errors
    - RequestValidationError: For request validation errors
    - ValidationError: For Pydantic model validation errors
    - APIException: For custom application errors
    - Exception: Catch-all for any unhandled exceptions

    It also adds middleware for request ID tracking and ensures consistent
    error responses across the application.

    Args:
        app: The FastAPI application instance
    """
    # Register handlers with appropriate exception types
    app.add_exception_handler(HTTPException, http_exception_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(ValidationError, validation_exception_handler)

    # Register our custom exception handler for APIException and its subclasses
    app.add_exception_handler(APIException, http_exception_handler)

    # Register a catch-all handler for any unhandled exceptions
    app.add_exception_handler(Exception, unexpected_exception_handler)

    # Add middleware to ensure all responses include the request ID
    @app.middleware("http")
    async def add_request_id_middleware(request: Request, call_next):
        # Generate or get request ID
        request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())

        # Add request ID to request state for logging
        request.state.request_id = request_id

        # Process the request
        start_time = time.time()
        try:
            response = await call_next(request)
            process_time = (time.time() - start_time) * 1000

            # Log successful request
            logger.info(
                "Request processed",
                extra={
                    "request": {
                        "method": request.method,
                        "url": str(request.url),
                        "client": request.client.host if request.client else None,
                        "user_agent": request.headers.get("user-agent"),
                        "id": request_id,
                        "duration_ms": f"{process_time:.2f}ms",
                        "status_code": response.status_code,
                    }
                },
            )

            # Add request ID to response headers
            response.headers["X-Request-ID"] = request_id
            return response

        except Exception as exc:
            # Log the error with request context
            logger.error(
                "Unhandled exception in request processing",
                exc_info=True,
                extra={
                    "request": {
                        "method": request.method,
                        "url": str(request.url),
                        "client": request.client.host if request.client else None,
                        "user_agent": request.headers.get("user-agent"),
                        "id": request_id,
                    },
                    "error": {
                        "type": exc.__class__.__name__,
                        "message": str(exc),
                        "traceback": traceback.format_exc(),
                    },
                },
            )

            # Return a 500 error with request ID
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={
                    "error": {
                        "code": "internal_server_error",
                        "message": "An unexpected error occurred",
                        "status_code": status.HTTP_500_INTERNAL_SERVER_ERROR,
                        "request_id": request_id,
                        "timestamp": datetime.utcnow().isoformat(),
                    }
                },
                headers={"X-Request-ID": request_id},
            )

    # Log that handlers have been registered
    logger.info("Registered error handlers for the application")
    return app
