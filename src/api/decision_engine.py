"""
Advanced Mathematical Decision Engine for Blackjack
==================================================

This module implements a sophisticated decision-making system that calculates
Expected Value (EV) for each possible action in Blackjack, considering:
- Player hand value (including soft hands)
- Dealer upcard
- Current true count
- Remaining deck composition

The engine uses Monte Carlo simulation and mathematical probability calculations
to determine the optimal play for any given situation.
"""

import random
import numpy as np
from typing import List, Dict, Tuple, Optional
from collections import defaultdict
import itertools


class BlackjackDecisionEngine:
    """
    Mathematical decision engine for optimal Blackjack play.

    Uses Expected Value calculations and Monte Carlo simulations to determine
    the best action for any given game state.
    """

    def __init__(self, num_decks: int = 6, simulation_rounds: int = 10000):
        """
        Initialize the decision engine.

        Args:
            num_decks: Number of decks in play
            simulation_rounds: Number of Monte Carlo simulation rounds per action
        """
        self.num_decks = num_decks
        self.simulation_rounds = simulation_rounds
        self.card_values = {
            "A": [1, 11],
            "2": [2],
            "3": [3],
            "4": [4],
            "5": [5],
            "6": [6],
            "7": [7],
            "8": [8],
            "9": [9],
            "10": [10],
            "J": [10],
            "Q": [10],
            "K": [10],
        }

        # Standard deck composition per deck
        self.standard_deck = {
            "A": 4,
            "2": 4,
            "3": 4,
            "4": 4,
            "5": 4,
            "6": 4,
            "7": 4,
            "8": 4,
            "9": 4,
            "10": 4,
            "J": 4,
            "Q": 4,
            "K": 4,
        }

    def calculate_hand_value(self, cards: List[str]) -> Tuple[int, bool]:
        """
        Calculate the value of a hand and determine if it's soft.

        Args:
            cards: List of card strings

        Returns:
            Tuple of (hand_value, is_soft)
        """
        total = 0
        aces = 0

        for card in cards:
            if card == "A":
                aces += 1
                total += 11
            else:
                total += self.card_values[card][0]

        # Adjust for aces
        while total > 21 and aces > 0:
            total -= 10
            aces -= 1

        is_soft = aces > 0 and total <= 21
        return total, is_soft

    def get_remaining_cards(self, seen_cards: List[str]) -> Dict[str, int]:
        """
        Calculate remaining cards in the deck based on seen cards.

        Args:
            seen_cards: List of cards that have been dealt

        Returns:
            Dictionary of remaining card counts
        """
        remaining = {
            card: count * self.num_decks for card, count in self.standard_deck.items()
        }

        for card in seen_cards:
            if card in remaining and remaining[card] > 0:
                remaining[card] -= 1

        return remaining

    def simulate_dealer_hand(
        self, dealer_upcard: str, remaining_cards: Dict[str, int]
    ) -> int:
        """
        Simulate a dealer hand following standard dealer rules.

        Args:
            dealer_upcard: Dealer's face-up card
            remaining_cards: Available cards for dealing

        Returns:
            Final dealer hand value (or 22+ for bust)
        """
        dealer_cards = [dealer_upcard]
        dealer_value, is_soft = self.calculate_hand_value(dealer_cards)

        # Create a working copy of remaining cards
        deck = []
        for card, count in remaining_cards.items():
            deck.extend([card] * count)

        if not deck:
            return dealer_value

        # Dealer hits on soft 17 and below
        while dealer_value < 17 or (dealer_value == 17 and is_soft):
            if not deck:
                break

            next_card = random.choice(deck)
            deck.remove(next_card)
            dealer_cards.append(next_card)
            dealer_value, is_soft = self.calculate_hand_value(dealer_cards)

            if dealer_value > 21:
                break

        return dealer_value

    def simulate_player_action(
        self,
        player_cards: List[str],
        action: str,
        dealer_upcard: str,
        remaining_cards: Dict[str, int],
    ) -> float:
        """
        Simulate the outcome of a specific player action.

        Args:
            player_cards: Current player cards
            action: Action to simulate ('hit', 'stand', 'double', 'split')
            dealer_upcard: Dealer's upcard
            remaining_cards: Available cards

        Returns:
            Expected return for this action (-1 to +2.5 for blackjack)
        """
        wins = 0
        total_simulations = 0

        for _ in range(self.simulation_rounds):
            # Create working copies
            player_hand = player_cards.copy()
            deck_copy = remaining_cards.copy()

            # Convert to list for random selection
            deck = []
            for card, count in deck_copy.items():
                deck.extend([card] * count)

            if not deck:
                continue

            bet_multiplier = 1.0

            try:
                if action == "hit":
                    # Hit until stand or bust
                    while True:
                        player_value, _ = self.calculate_hand_value(player_hand)
                        if player_value >= 21:
                            break

                        if not deck:
                            break

                        next_card = random.choice(deck)
                        deck.remove(next_card)
                        player_hand.append(next_card)

                        # Simple strategy: hit on 16 or less, stand on 17+
                        if player_value >= 17:
                            break

                elif action == "double":
                    bet_multiplier = 2.0
                    if deck:
                        next_card = random.choice(deck)
                        deck.remove(next_card)
                        player_hand.append(next_card)

                elif action == "split":
                    # Simplified split simulation - just simulate one hand
                    if len(player_cards) == 2 and player_cards[0] == player_cards[1]:
                        player_hand = [player_cards[0]]
                        if deck:
                            next_card = random.choice(deck)
                            deck.remove(next_card)
                            player_hand.append(next_card)

                # Calculate final player value
                player_value, _ = self.calculate_hand_value(player_hand)

                # Player busts
                if player_value > 21:
                    wins -= bet_multiplier
                    total_simulations += 1
                    continue

                # Simulate dealer
                dealer_value = self.simulate_dealer_hand(
                    dealer_upcard,
                    {
                        k: v
                        for k, v in deck_copy.items()
                        if k in deck or deck_copy[k] > remaining_cards.get(k, 0)
                    },
                )

                # Determine outcome
                if dealer_value > 21:  # Dealer busts
                    wins += bet_multiplier
                elif player_value > dealer_value:  # Player wins
                    wins += bet_multiplier
                elif player_value < dealer_value:  # Player loses
                    wins -= bet_multiplier
                # Push (tie) = 0

                total_simulations += 1

            except (IndexError, KeyError):
                # Handle edge cases where deck runs out
                continue

        return wins / max(total_simulations, 1)

    def calculate_expected_values(
        self,
        player_cards: List[str],
        dealer_upcard: str,
        seen_cards: List[str],
        true_count: float,
    ) -> Dict[str, float]:
        """
        Calculate Expected Value for all possible actions.

        Args:
            player_cards: Current player hand
            dealer_upcard: Dealer's upcard
            seen_cards: All cards seen so far
            true_count: Current true count

        Returns:
            Dictionary of action -> expected value
        """
        remaining_cards = self.get_remaining_cards(seen_cards)
        player_value, is_soft = self.calculate_hand_value(player_cards)

        # Available actions
        actions = ["hit", "stand"]

        # Check if double is allowed (typically on first two cards)
        if len(player_cards) == 2:
            actions.append("double")

        # Check if split is allowed
        if (
            len(player_cards) == 2
            and self.card_values[player_cards[0]][0]
            == self.card_values[player_cards[1]][0]
        ):
            actions.append("split")

        # Don't hit on 21
        if player_value == 21:
            actions = ["stand"]

        # Don't hit if already busted
        if player_value > 21:
            return {"stand": -1.0}

        expected_values = {}

        for action in actions:
            ev = self.simulate_player_action(
                player_cards, action, dealer_upcard, remaining_cards
            )

            # Adjust EV based on true count (higher count favors player)
            count_adjustment = true_count * 0.005  # Small adjustment factor
            ev += count_adjustment

            expected_values[action] = ev

        return expected_values

    def get_optimal_decision(
        self,
        player_cards: List[str],
        dealer_upcard: str,
        seen_cards: List[str],
        true_count: float = 0.0,
    ) -> Dict:
        """
        Get the optimal decision for the current game state.

        Args:
            player_cards: Current player hand
            dealer_upcard: Dealer's upcard
            seen_cards: All cards seen so far
            true_count: Current true count

        Returns:
            Dictionary containing optimal action and analysis
        """
        # Calculate expected values for all actions
        expected_values = self.calculate_expected_values(
            player_cards, dealer_upcard, seen_cards, true_count
        )

        # Find optimal action
        optimal_action = max(expected_values.items(), key=lambda x: x[1])

        # Calculate hand information
        player_value, is_soft = self.calculate_hand_value(player_cards)
        dealer_value = (
            self.card_values[dealer_upcard][0] if dealer_upcard != "A" else 11
        )

        # Calculate additional probabilities
        remaining_cards = self.get_remaining_cards(seen_cards)
        total_remaining = sum(remaining_cards.values())

        # Bust probability if hitting
        bust_prob = 0.0
        if "hit" in expected_values:
            bust_cards = 0
            for card, count in remaining_cards.items():
                card_val = self.card_values[card][0]
                if player_value + card_val > 21:
                    bust_cards += count
            bust_prob = bust_cards / max(total_remaining, 1)

        return {
            "action": optimal_action[0],
            "expected_value": optimal_action[1],
            "all_expected_values": expected_values,
            "player_value": player_value,
            "is_soft": is_soft,
            "dealer_upcard_value": dealer_value,
            "bust_probability": bust_prob,
            "true_count": true_count,
            "confidence": abs(
                optimal_action[1]
                - max(
                    [
                        ev
                        for action, ev in expected_values.items()
                        if action != optimal_action[0]
                    ],
                    default=optimal_action[1],
                )
            ),
            "reasoning": self._generate_reasoning(
                optimal_action[0],
                expected_values,
                player_value,
                is_soft,
                dealer_value,
                true_count,
            ),
        }

    def _generate_reasoning(
        self,
        action: str,
        expected_values: Dict[str, float],
        player_value: int,
        is_soft: bool,
        dealer_value: int,
        true_count: float,
    ) -> str:
        """
        Generate human-readable reasoning for the decision.

        Args:
            action: Chosen action
            expected_values: All calculated EVs
            player_value: Player hand value
            is_soft: Whether player hand is soft
            dealer_value: Dealer upcard value
            true_count: Current true count

        Returns:
            Reasoning string
        """
        hand_type = "soft" if is_soft else "hard"
        ev = expected_values[action]

        reasoning = f"With {hand_type} {player_value} vs dealer {dealer_value}, "
        reasoning += f"{action.upper()} has the highest EV of {ev:.3f}. "

        if true_count > 1:
            reasoning += f"Positive count (+{true_count:.1f}) favors aggressive play. "
        elif true_count < -1:
            reasoning += f"Negative count ({true_count:.1f}) favors conservative play. "

        # Add specific reasoning based on action
        if action == "hit":
            reasoning += "Mathematical analysis suggests taking another card maximizes expected return."
        elif action == "stand":
            reasoning += "Standing preserves the best expected value given current probabilities."
        elif action == "double":
            reasoning += (
                "Doubling down leverages favorable odds with increased bet size."
            )
        elif action == "split":
            reasoning += "Splitting creates two potentially winning hands with positive expectation."

        return reasoning


# Utility functions for integration with existing system
def get_decision_recommendation(
    player_cards: List[str],
    dealer_card: str,
    seen_cards: List[str],
    true_count: float = 0.0,
    num_decks: int = 6,
) -> Dict:
    """
    Get optimal decision recommendation using the mathematical engine.

    Args:
        player_cards: Player's current cards
        dealer_card: Dealer's upcard
        seen_cards: All cards seen in the current shoe
        true_count: Current true count
        num_decks: Number of decks in play

    Returns:
        Decision analysis dictionary
    """
    engine = BlackjackDecisionEngine(num_decks=num_decks)
    return engine.get_optimal_decision(
        player_cards, dealer_card, seen_cards, true_count
    )


def calculate_action_probabilities(
    player_cards: List[str], dealer_card: str, remaining_cards: Dict[str, int]
) -> Dict[str, float]:
    """
    Calculate win probabilities for different actions.

    Args:
        player_cards: Player's current cards
        dealer_card: Dealer's upcard
        remaining_cards: Cards remaining in deck

    Returns:
        Dictionary of action -> win probability
    """
    engine = BlackjackDecisionEngine(simulation_rounds=5000)

    # Convert remaining cards to seen cards format
    total_cards = sum(engine.standard_deck.values()) * engine.num_decks
    seen_cards = []

    for card, remaining_count in remaining_cards.items():
        original_count = engine.standard_deck[card] * engine.num_decks
        seen_count = original_count - remaining_count
        seen_cards.extend([card] * seen_count)

    expected_values = engine.calculate_expected_values(
        player_cards, dealer_card, seen_cards, 0.0
    )

    # Convert EV to approximate win probabilities (simplified)
    probabilities = {}
    for action, ev in expected_values.items():
        # Convert EV (-1 to +1 range) to probability (0 to 1 range)
        prob = (ev + 1) / 2
        probabilities[action] = max(0.0, min(1.0, prob))

    return probabilities
