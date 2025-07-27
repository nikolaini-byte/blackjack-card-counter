"""
Bankroll management endpoints for the Blackjack Card Counter API.

This module handles all bankroll-related API endpoints.
"""
from fastapi import APIRouter, HTTPException, Query
from typing import Optional

from ..models.schemas import BankrollRequest
from ..services import bankroll_service

router = APIRouter()

@router.post(
    "/calculate",
    summary="Calculate bankroll management",
    description="Calculate recommended bet sizes and bankroll metrics",
    response_description="Bankroll management recommendations"
)
async def calculate_bankroll(bankroll_request: BankrollRequest):
    """
    Calculate recommended bet sizes and bankroll management metrics.
    
    This endpoint takes the current bankroll, true count, and risk parameters,
    and returns recommended bet sizes and other bankroll management metrics.
    
    - **bankroll**: Current bankroll amount
    - **true_count**: Current true count
    - **risk_tolerance**: Acceptable risk level (0-1, default: 0.02)
    - **min_bet**: Minimum bet amount (default: 10.0)
    - **max_bet**: Maximum bet amount (default: 500.0)
    
    Returns:
        dict: Bankroll management recommendations
    """
    try:
        return bankroll_service.manage_bankroll(bankroll_request)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error in calculate_bankroll: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get(
    "/required-bankroll",
    summary="Calculate required bankroll",
    description="Calculate the bankroll needed to achieve a desired income",
    response_description="Bankroll requirements"
)
async def calculate_required_bankroll(
    desired_income: float = Query(..., gt=0, description="Desired income per session"),
    sessions_per_week: int = Query(..., gt=0, le=7, description="Number of playing sessions per week"),
    weeks: int = Query(..., gt=0, description="Number of weeks to plan for"),
    risk_tolerance: float = Query(0.02, gt=0, le=1, description="Acceptable risk level (0-1)"),
    avg_true_count: float = Query(1.0, description="Expected average true count")
):
    """
    Calculate the bankroll needed to achieve a desired income.
    
    This endpoint helps players determine how much bankroll they need to
    achieve their desired income based on their playing schedule and risk tolerance.
    
    Args:
        desired_income: Desired income per session
        sessions_per_week: Number of playing sessions per week
        weeks: Number of weeks to plan for
        risk_tolerance: Acceptable risk level (0-1, default: 0.02)
        avg_true_count: Expected average true count (default: 1.0)
        
    Returns:
        dict: Bankroll requirements and statistics
    """
    try:
        return bankroll_service.calculate_bankroll_needed(
            desired_income=desired_income,
            sessions_per_week=sessions_per_week,
            weeks=weeks,
            risk_tolerance=risk_tolerance,
            avg_true_count=avg_true_count
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error in calculate_required_bankroll: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")
