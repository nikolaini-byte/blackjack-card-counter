"""
Utility functions for card and game calculations.
"""
from typing import List, Dict, Tuple, Optional


def calculate_hand_value(cards: List[str]) -> int:
    """
    Calculate the value of a hand of cards.

    Args:
        cards: List of card values (e.g., ['A', 'K', '5'])

    Returns:
        int: Total value of the hand
    """
    value = 0
    aces = 0

    for card in cards:
        if card == "A":
            aces += 1
            value += 11
        elif card in ["K", "Q", "J", "10"]:
            value += 10
        else:
            value += int(card)

    # Adjust for aces
    while value > 21 and aces > 0:
        value -= 10
        aces -= 1

    return value


def calculate_advanced_probabilities(
    player_cards: List[str], dealer_card: str, cards_seen: List[str], decks: float
) -> Dict[str, float]:
    """
    Calculate advanced probabilities for the current game state.

    Args:
        player_cards: List of player's cards
        dealer_card: Dealer's up card
        cards_seen: All cards seen so far
        decks: Number of decks in play

    Returns:
        Dict with probability values
    """
    # Calculate remaining cards
    total_cards_per_deck = {
        "A": 4,
        "2": 4,
        "3": 4,
        "4": 4,
        "5": 4,
        "6": 4,
        "7": 4,
        "8": 4,
        "9": 4,
        "10": 16,  # 10, J, Q, K
    }

    # Initialize remaining cards
    remaining_cards = {}
    for card, count in total_cards_per_deck.items():
        remaining_cards[card] = int(count * decks)

    # Remove seen cards
    for card in cards_seen:
        if card in remaining_cards:
            remaining_cards[card] -= 1
            if remaining_cards[card] < 0:
                remaining_cards[card] = 0

    # Calculate total remaining cards
    total_remaining = sum(remaining_cards.values())

    # Simple probability calculation (simplified for example)
    if total_remaining == 0:
        return {"bust": 0.0, "win": 0.5, "lose": 0.5, "push": 0.0}

    # Calculate probability of busting on next hit
    bust_cards = 0
    hand_value = calculate_hand_value(player_cards)

    for card, count in remaining_cards.items():
        new_hand = player_cards + [card]
        new_value = calculate_hand_value(new_hand)
        if new_value > 21:
            bust_cards += count

    bust_probability = bust_cards / total_remaining if total_remaining > 0 else 0.0

    # Simplified win/lose/push calculation
    # In a real implementation, this would use more sophisticated simulation
    return {
        "bust": round(bust_probability, 4),
        "win": round(0.4 * (1 - bust_probability), 4),  # Placeholder
        "lose": round(0.5 * (1 - bust_probability), 4),  # Placeholder
        "push": round(0.1 * (1 - bust_probability), 4),  # Placeholder
    }
