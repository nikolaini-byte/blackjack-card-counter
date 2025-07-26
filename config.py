"""
Blackjack Card Counter - Konfiguration
"""
import os

# Server-Konfiguration
SERVER_HOST = os.getenv('SERVER_HOST', '127.0.0.1')
API_PORT = int(os.getenv('API_PORT', '8000'))
FRONTEND_PORT = int(os.getenv('FRONTEND_PORT', '8080'))

# Anwendungseinstellungen
DEFAULT_DECKS = 3
DEFAULT_COUNT_METHOD = 'hiLo'
DEFAULT_LANGUAGE = 'de'

# Pfade
TEMPLATES_DIR = 'src/templates'
STATIC_DIR = 'src/static'

# API-Einstellungen
API_BASE_URL = f'http://{SERVER_HOST}:{API_PORT}'
CORS_ORIGINS = ["*"]

# Entwicklungsmodus
DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'
