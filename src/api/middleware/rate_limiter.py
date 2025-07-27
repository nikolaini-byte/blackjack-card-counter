"""
Rate limiting middleware for the Blackjack Card Counter API.

This module provides rate limiting functionality to prevent abuse of the API
and ensure fair usage for all clients.
"""
import time
import json
from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
from fastapi_limiter import FastAPILimiter
from fastapi_limiter.depends import RateLimiter
from typing import Callable, Awaitable, Dict, Any
import logging

logger = logging.getLogger(__name__)

# Rate limit configuration (requests per minute)
RATE_LIMITS = {
    "default": 60,  # 60 requests per minute for general endpoints
    "strategy": 30,  # 30 requests per minute for strategy endpoints
    "intensive": 10,  # 10 requests per minute for resource-intensive operations
}

# Path-based rate limiting rules
PATH_RATE_LIMITS = {
    "/api/strategy/recommend": "strategy",
    "/api/strategy/basic-strategy": "strategy",
    "/api/strategy/counting-system": "strategy",
    "/api/bankroll/calculate": "intensive",
}

async def get_rate_limit_key(request: Request) -> str:
    """
    Generate a rate limit key based on the client's IP address.
    
    Args:
        request: The incoming request
        
    Returns:
        str: A unique key for rate limiting
    """
    # Use X-Forwarded-For header if behind a proxy
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        client_ip = forwarded.split(",")[0]
    else:
        client_ip = request.client.host or "unknown"
    
    # Get the path-specific rate limit type
    path = request.url.path
    rate_limit_type = PATH_RATE_LIMITS.get(path, "default")
    
    # Combine IP and rate limit type for the key
    return f"rate_limit:{rate_limit_type}:{client_ip}"

async def rate_limit_middleware(
    request: Request, 
    call_next: Callable[[Request], Awaitable[Any]]
) -> JSONResponse:
    """
    Middleware to enforce rate limiting on API endpoints.
    
    Args:
        request: The incoming request
        call_next: The next middleware or route handler
        
    Returns:
        Response: The API response with rate limit headers
        
    Raises:
        HTTPException: 429 if rate limit is exceeded
    """
    # Skip rate limiting for certain paths (e.g., health checks)
    if request.url.path in ["/api/health", "/docs", "/redoc", "/openapi.json"]:
        return await call_next(request)
    
    # Skip rate limiting in test mode or if Redis is not initialized
    redis = getattr(FastAPILimiter, 'redis', None)
    if redis is None:
        return await call_next(request)
    
    # Get the rate limit key and type
    rate_limit_type = PATH_RATE_LIMITS.get(request.url.path, "default")
    rate_limit = RATE_LIMITS.get(rate_limit_type, RATE_LIMITS["default"])
    
    # Generate a unique key for this client and endpoint
    key = await get_rate_limit_key(request)
    
    # Check if we've exceeded the rate limit
    current = await redis.get(key)
    
    if current and int(current) >= rate_limit:
        # Calculate retry-after time (in seconds)
        retry_after = 60 - int(time.time() % 60)
        
        # Set rate limit headers
        headers = {
            "Retry-After": str(retry_after),
            "X-RateLimit-Limit": str(rate_limit),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": str(int(time.time()) + retry_after)
        }
        
        logger.warning(f"Rate limit exceeded for {key}")
        
        return JSONResponse(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            content={
                "detail": f"Rate limit exceeded: {rate_limit} requests per minute",
                "retry_after": retry_after
            },
            headers=headers
        )
    
    # Increment the request count
    pipeline = redis.pipeline()
    pipeline.incr(key)
    pipeline.expire(key, 60)  # Reset counter after 60 seconds
    await pipeline.execute()
    
    # Add rate limit headers to the response
    remaining = max(0, rate_limit - (int(current or 0) + 1))
    response = await call_next(request)
    
    response.headers["X-RateLimit-Limit"] = str(rate_limit)
    response.headers["X-RateLimit-Remaining"] = str(remaining)
    response.headers["X-RateLimit-Reset"] = str(int(time.time()) + 60 - int(time.time() % 60))
    
    return response

# Rate limiter dependency that can be used with route decorators
def get_rate_limiter(limit: int = 60, key_func: Callable[[Request], str] = None):
    """
    Create a rate limiter dependency.
    
    Args:
        limit: Maximum number of requests per minute
        key_func: Function to generate rate limit key
        
    Returns:
        A dependency that enforces the rate limit
    """
    return RateLimiter(
        times=limit,
        seconds=60,
        key_func=key_func or (lambda x: x.client.host or "default")
    )
