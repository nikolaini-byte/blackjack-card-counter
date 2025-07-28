"""
Blackjack Card Counter - Konfiguration
"""
import os

# Server-Konfiguration
# Use 0.0.0.0 to listen on all network interfaces
SERVER_HOST = os.getenv(
    "SERVER_HOST", "127.0.0.1"
)  # Changed to localhost for local development
API_PORT = int(os.getenv("PORT", "8000"))  # Standard port for Railway/Render
FRONTEND_PORT = API_PORT  # Use same port for frontend and backend in production

# Anwendungseinstellungen
DEFAULT_DECKS = 3
DEFAULT_COUNT_METHOD = "hiLo"
DEFAULT_LANGUAGE = "de"

# Pfade
TEMPLATES_DIR = "src/templates"
STATIC_DIR = "src/static"

# API-Einstellungen
API_BASE_URL = f"http://{SERVER_HOST}:{API_PORT}"
CORS_ORIGINS = ["*"]

# Entwicklungsmodus
DEBUG = os.getenv("DEBUG", "False").lower() == "true"
