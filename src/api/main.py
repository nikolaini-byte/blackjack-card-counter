"""
Main FastAPI application for the Blackjack Card Counter API.

This module creates and configures the FastAPI application with all routes,
middleware, and exception handlers.
"""
import logging
import logging.handlers
import os
from typing import Optional
from fastapi import FastAPI, Request, status, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi_limiter import FastAPILimiter
from fastapi_limiter.depends import RateLimiter
import redis.asyncio as redis
from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend
from fastapi_cache.decorator import cache

# Import routes
from .routes import router as api_router
from .middleware.rate_limiter import rate_limit_middleware

# Configure logging
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()
LOG_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
LOG_DATE_FORMAT = "%Y-%m-%d %H:%M:%S"

# Create logs directory if it doesn't exist
os.makedirs("logs", exist_ok=True)

# Configure root logger
logging.basicConfig(
    level=LOG_LEVEL,
    format=LOG_FORMAT,
    datefmt=LOG_DATE_FORMAT,
    handlers=[
        logging.StreamHandler(),
        logging.handlers.RotatingFileHandler(
            "logs/blackjack_api.log",
            maxBytes=10 * 1024 * 1024,  # 10MB
            backupCount=5,
            encoding="utf-8",
        ),
    ],
)

# Configure specific loggers
logging.getLogger("uvicorn").setLevel(logging.WARNING)
logging.getLogger("uvicorn.error").setLevel(logging.WARNING)
logging.getLogger("fastapi").setLevel(logging.WARNING)

# Get logger for this module
logger = logging.getLogger(__name__)

# Log application startup
logger.info("Starting Blackjack Card Counter API")
logger.info("Log level set to: %s", LOG_LEVEL)


async def create_app(testing: bool = False) -> FastAPI:
    """
    Create and configure the FastAPI application with caching and rate limiting.

    Args:
        testing: If True, skips Redis initialization for testing

    Returns:
        FastAPI: Configured FastAPI application instance with caching and rate limiting
    """
    app = FastAPI(
        title="Blackjack Card Counter API",
        description="Advanced card counting and strategy analysis for Blackjack",
        version="1.0.0",
        docs_url="/api/docs",
        redoc_url="/api/redoc",
        openapi_url="/api/openapi.json",
    )

    # Configure CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=os.getenv("ALLOWED_ORIGINS", "*").split(","),
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Add rate limiting middleware
    app.middleware("http")(rate_limit_middleware)

    # Skip Redis initialization in test mode
    if not testing:
        try:
            # Initialize Redis connection for rate limiting and caching
            redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
            redis_connection = redis.from_url(
                redis_url, encoding="utf-8", decode_responses=True
            )

            # Initialize FastAPILimiter for rate limiting
            await FastAPILimiter.init(redis_connection)

            # Initialize FastAPI Cache with Redis backend
            FastAPICache.init(RedisBackend(redis_connection), prefix="fastapi-cache")
        except Exception as e:
            logger.warning(
                f"Failed to initialize Redis: {e}. Running without rate limiting and caching."
            )

    # Include API routes
    app.include_router(api_router)

    # Add startup and shutdown event handlers
    @app.on_event("startup")
    async def startup():
        logger.info("Starting up application...")
        # Verify Redis connection
        if not testing:
            try:
                await redis.ping()
                logger.info("Successfully connected to Redis")
            except Exception as e:
                logger.error(f"Failed to connect to Redis: {e}")
                raise

    @app.on_event("shutdown")
    async def shutdown():
        logger.info("Shutting down application...")
        if not testing:
            await redis.close()

    # Add exception handlers
    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(
        request: Request, exc: RequestValidationError
    ):
        """Handle validation errors with detailed error messages."""
        errors = []
        for error in exc.errors():
            field = ".".join([str(x) for x in error["loc"][1:]])
            errors.append(
                {
                    "field": field if field else "body",
                    "message": error["msg"],
                    "type": error["type"],
                }
            )

        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={"detail": "Validation error", "errors": errors},
        )

    @app.exception_handler(500)
    async def internal_server_error_handler(request: Request, exc: Exception):
        """Handle internal server errors with logging."""
        logger.error(f"Internal server error: {str(exc)}", exc_info=True)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Internal server error"},
        )

    return app


# Create the application instance
app = create_app()

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
