"""
Counting systems for card counting in Blackjack.

This module contains various card counting systems and related utilities.
"""
from typing import Dict, List, Optional

# Define counting systems with their point values for each card
COUNTING_SYSTEMS = {
    "hiLo": {
        "2": 1,
        "3": 1,
        "4": 1,
        "5": 1,
        "6": 1,
        "7": 0,
        "8": 0,
        "9": 0,
        "10": -1,
        "J": -1,
        "Q": -1,
        "K": -1,
        "A": -1,
    },
    "hiOptI": {
        "2": 0,
        "3": 1,
        "4": 1,
        "5": 1,
        "6": 1,
        "7": 1,
        "8": 0,
        "9": 0,
        "10": -1,
        "J": -1,
        "Q": -1,
        "K": -1,
        "A": 0,
    },
    "hiOptII": {
        "2": 1,
        "3": 1,
        "4": 2,
        "5": 2,
        "6": 2,
        "7": 1,
        "8": 0,
        "9": -1,
        "10": -2,
        "J": -2,
        "Q": -2,
        "K": -2,
        "A": 0,
    },
    "ko": {
        "2": 1,
        "3": 1,
        "4": 1,
        "5": 1,
        "6": 1,
        "7": 1,
        "8": 0,
        "9": 0,
        "10": -1,
        "J": -1,
        "Q": -1,
        "K": -1,
        "A": -1,
    },
    "omegaII": {
        "2": 1,
        "3": 1,
        "4": 2,
        "5": 2,
        "6": 2,
        "7": 1,
        "8": 0,
        "9": -1,
        "10": -2,
        "J": -2,
        "Q": -2,
        "K": -2,
        "A": 0,
    },
    "zenCount": {
        "2": 1,
        "3": 1,
        "4": 2,
        "5": 2,
        "6": 2,
        "7": 1,
        "8": 0,
        "9": -1,
        "10": -2,
        "J": -2,
        "Q": -2,
        "K": -2,
        "A": -1,
    },
}


def get_counting_system(system_name: str = "hiLo") -> Dict[str, int]:
    """
    Get the counting system point values.

    Args:
        system_name: Name of the counting system

    Returns:
        Dict with card values as keys and point values as values

    Raises:
        ValueError: If the counting system is not found
    """
    system = COUNTING_SYSTEMS.get(system_name)
    if system is None:
        raise ValueError(f"Unknown counting system: {system_name}")
    return system


def calculate_running_count(cards: List[str], system_name: str = "hiLo") -> int:
    """
    Calculate the running count for a list of cards.

    Args:
        cards: List of card values
        system_name: Name of the counting system to use

    Returns:
        int: Running count
    """
    system = get_counting_system(system_name)
    return sum(system.get(card, 0) for card in cards)


def calculate_true_count(
    running_count: int, decks_remaining: float, system_name: str = "hiLo"
) -> float:
    """
    Calculate the true count from the running count.

    Args:
        running_count: Current running count
        decks_remaining: Number of decks remaining in the shoe
        system_name: Name of the counting system (for future compatibility)

    Returns:
        float: True count
    """
    if decks_remaining <= 0:
        return 0.0
    return running_count / decks_remaining
