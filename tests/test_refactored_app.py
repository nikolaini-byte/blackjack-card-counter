"""
Tests for the refactored Blackjack Card Counter API.

These tests verify that the refactored application works as expected.
"""
import os
import sys
import pytest
import asyncio
from fastapi.testclient import TestClient
from fastapi import FastAPI
from fastapi_cache import FastAPICache
from fastapi_cache.backends.inmemory import InMemoryBackend

# Add the src directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.api.main import create_app
from src.api.models.schemas import CardInput, StrategyRequest, BankrollRequest

# Create test client with async app creation
@pytest.fixture(scope="module")
def test_client():
    # Create a new app instance for testing with Redis disabled
    test_app = asyncio.run(create_app(testing=True))
    
    # Initialize FastAPI Cache with in-memory backend for testing
    FastAPICache.init(InMemoryBackend(), prefix="test-cache")
    
    with TestClient(test_app) as client:
        yield client

# Use the test client fixture in all tests
@pytest.fixture(autouse=True)
def setup_test_client(test_client, monkeypatch):
    # Make the test client available to all tests
    global client
    client = test_client

def test_root_endpoint():
    """Test the root endpoint returns HTML."""
    response = client.get("/")
    assert response.status_code == 200
    assert "text/html" in response.headers["content-type"]
    assert "Blackjack Card Counter API" in response.text

def test_health_check():
    """Test the health check endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {
        "status": "ok",
        "version": "1.0.0",
        "service": "blackjack-card-counter"
    }

def test_analyze_cards():
    """Test the card analysis endpoint."""
    test_data = {
        "cards": ["A", "K"],
        "dealer_card": "6",
        "true_count": 1.5,
        "decks": 6.0,
        "counting_system": "hiLo",
        "penetration": 0.5
    }
    
    response = client.post("/api/cards/analyze", json=test_data)
    assert response.status_code == 200
    data = response.json()
    
    # Check response structure
    assert "counting_analysis" in data
    assert "statistics" in data
    assert "recommendations" in data
    
    # Check some specific values
    assert data["counting_analysis"]["true_count"] == 1.5
    assert data["statistics"]["player_hand_value"] == 21
    assert data["recommendations"]["action"] in ["HIT", "STAND"]

def test_get_strategy():
    """Test the strategy recommendation endpoint."""
    test_data = {
        "player_hand": ["10", "6"],
        "dealer_card": "9",
        "true_count": 0.0,
        "decks": 6.0,
        "counting_system": "hiLo"
    }
    
    response = client.post("/api/strategy/recommend", json=test_data)
    assert response.status_code == 200
    data = response.json()
    
    assert "action" in data
    assert "confidence" in data
    assert "alternatives" in data
    assert isinstance(data["alternatives"], list)

def test_calculate_bankroll():
    """Test the bankroll calculation endpoint."""
    test_data = {
        "bankroll": 1000.0,
        "true_count": 2.0,
        "risk_tolerance": 0.02,
        "min_bet": 10.0,
        "max_bet": 500.0
    }
    
    response = client.post("/api/bankroll/calculate", json=test_data)
    assert response.status_code == 200
    data = response.json()
    
    assert "recommended_bet" in data
    assert "risk_of_ruin" in data
    assert "expected_value" in data
    assert "kelly_bet" in data
    assert "half_kelly_bet" in data

def test_validation_errors():
    """Test that validation errors are handled properly."""
    # Test with invalid card value
    invalid_data = {
        "cards": ["X"],  # Invalid card
        "dealer_card": "6",
        "decks": 6.0
    }
    
    response = client.post("/api/cards/analyze", json=invalid_data)
    assert response.status_code == 422
    
    # Test with missing required field
    missing_data = {
        "dealer_card": "6",
        "decks": 6.0
    }
    
    response = client.post("/api/cards/analyze", json=missing_data)
    assert response.status_code == 422

if __name__ == "__main__":
    pytest.main(["-v", "test_refactored_app.py"])
