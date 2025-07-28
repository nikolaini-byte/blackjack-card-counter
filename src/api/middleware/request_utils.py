"""
Request-related utility functions.

This module contains utility functions for working with HTTP requests.
"""
from datetime import datetime
from typing import Dict, Any, Optional
from fastapi import Request


def get_request_context(request: Optional[Request] = None) -> Dict[str, Any]:
    """Extract relevant context from the request for error logging.

    Args:
        request: The FastAPI request object

    Returns:
        Dict containing request context information
    """
    if not request:
        return {
            "request_id": str(uuid.uuid4()),
            "timestamp": datetime.utcnow().isoformat(),
        }

    # Get or generate request ID
    request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())

    # Extract relevant request information
    return {
        "request_id": request_id,
        "url": str(request.url) if request.url else None,
        "method": request.method,
        "client": request.client.host if request.client else None,
        "user_agent": request.headers.get("user-agent"),
        "timestamp": datetime.utcnow().isoformat(),
    }
