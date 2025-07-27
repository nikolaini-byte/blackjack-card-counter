"""
Root endpoint for the Blackjack Card Counter API.

This module handles the root endpoint and basic API information.
"""
from fastapi import APIRouter
from fastapi.responses import HTMLResponse

router = APIRouter()

@router.get(
    "/",
    response_class=HTMLResponse,
    summary="Root endpoint",
    description="Returns the main HTML page for the Blackjack Card Counter API"
)
async def root():
    """
    Root endpoint that returns the main HTML page.
    
    Returns:
        HTMLResponse: The main HTML page
    """
    return """
    <!DOCTYPE html>
    <html>
        <head>
            <title>Blackjack Card Counter API</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 20px;
                    line-height: 1.6;
                }
                h1 {
                    color: #2c3e50;
                    border-bottom: 2px solid #3498db;
                    padding-bottom: 10px;
                }
                .endpoint {
                    background-color: #f8f9fa;
                    border-left: 4px solid #3498db;
                    padding: 15px;
                    margin: 15px 0;
                    border-radius: 0 4px 4px 0;
                }
                code {
                    background-color: #f1f1f1;
                    padding: 2px 5px;
                    border-radius: 3px;
                }
                a {
                    color: #3498db;
                    text-decoration: none;
                }
                a:hover {
                    text-decoration: underline;
                }
            </style>
        </head>
        <body>
            <h1>Blackjack Card Counter API</h1>
            <p>Welcome to the Blackjack Card Counter API. This service provides endpoints for analyzing blackjack hands, getting strategy recommendations, and managing your bankroll.</p>
            
            <h2>API Endpoints</h2>
            
            <div class="endpoint">
                <h3>Card Analysis</h3>
                <p><strong>POST</strong> <code>/api/cards/analyze</code></p>
                <p>Analyze the current game state and get recommendations.</p>
            </div>
            
            <div class="endpoint">
                <h3>Strategy Recommendation</h3>
                <p><strong>POST</strong> <code>/api/strategy/recommend</code></p>
                <p>Get strategy recommendations for the current hand.</p>
            </div>
            
            <div class="endpoint">
                <h3>Bankroll Management</h3>
                <p><strong>POST</strong> <code>/api/bankroll/calculate</code></p>
                <p>Calculate recommended bet sizes and bankroll metrics.</p>
            </div>
            
            <h2>Documentation</h2>
            <ul>
                <li><a href="/docs" target="_blank">Interactive API Documentation (Swagger UI)</a></li>
                <li><a href="/redoc" target="_blank">Alternative Documentation (ReDoc)</a></li>
            </ul>
            
            <h2>Source Code</h2>
            <p>This project is open source. You can find the source code on <a href="https://github.com/yourusername/blackjack-card-counter" target="_blank">GitHub</a>.</p>
        </body>
    </html>
    """

@router.get(
    "/health",
    summary="Health check",
    description="Check if the API is running"
)
async def health_check():
    """
    Health check endpoint.
    
    Returns:
        dict: Status of the API
    """
    return {
        "status": "ok",
        "version": "1.0.0",
        "service": "blackjack-card-counter"
    }
