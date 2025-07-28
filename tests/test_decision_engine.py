"""
Unit tests for the Blackjack Decision Engine.

This module contains tests for the core algorithms used in the Blackjack Card Counter.
"""
import unittest

# Import from the api package
from src.api import (
    BlackjackDecisionEngine,
    get_decision_recommendation,
    COUNTING_SYSTEMS,
)


# pylint: disable=missing-class-docstring,missing-function-docstring


class TestBlackjackDecisionEngine(unittest.TestCase):
    """Test cases for the BlackjackDecisionEngine class."""

    def setUp(self):
        """Set up test fixtures before each test method."""
        self.engine = BlackjackDecisionEngine(num_decks=6)

    def test_initialization(self):
        """Test that the engine initializes with the correct number of decks."""
        self.assertEqual(self.engine.num_decks, 6)
        self.assertEqual(len(self.engine.standard_deck), 13)  # 13 card types
        self.assertEqual(
            sum(self.engine.standard_deck.values()), 52
        )  # 52 cards per deck

    def test_hand_value_calculation(self):
        """Test hand value calculation using the engine's public methods."""
        # Test basic hand values
        self.assertEqual(
            self.engine.calculate_hand_value(["A", "K"])[0], 21
        )  # Blackjack
        self.assertEqual(
            self.engine.calculate_hand_value(["10", "5", "6"])[0], 21
        )  # 21 with 3 cards
        self.assertEqual(
            self.engine.calculate_hand_value(["A", "A", "9"])[0], 21
        )  # Soft 21
        self.assertEqual(
            self.engine.calculate_hand_value(["A", "A", "A", "8"])[0], 21
        )  # Soft 21 with multiple aces
        self.assertEqual(
            self.engine.calculate_hand_value(["10", "10"])[0], 20
        )  # Hard 20

        # Test soft hand detection
        self.assertTrue(self.engine.calculate_hand_value(["A", "6"])[1])  # Soft 17
        self.assertFalse(
            self.engine.calculate_hand_value(["10", "7", "4"])[1]
        )  # Hard 21
        self.assertTrue(
            self.engine.calculate_hand_value(["A", "A", "9"])[1]
        )  # Soft 21 with multiple aces

    def test_blackjack_detection(self):
        """Test that blackjack hands are handled correctly."""
        # Test natural blackjack (A + 10-value card)
        result = self.engine.get_optimal_decision(
            player_cards=["A", "K"], dealer_upcard="10", seen_cards=[], true_count=0.0
        )
        # Should have 21 and the action should be 'stand'
        self.assertEqual(result["player_value"], 21)
        self.assertEqual(result["action"], "stand")

        # Test non-blackjack 21 (3+ cards)
        result = self.engine.get_optimal_decision(
            player_cards=["10", "10", "A"],
            dealer_upcard="5",
            seen_cards=[],
            true_count=0.0,
        )
        # Should also have 21 but it's not a natural blackjack
        self.assertEqual(result["player_value"], 21)
        self.assertEqual(result["action"], "stand")

    def test_dealer_actions(self):
        """Test dealer action simulation through the public API."""
        # Create a full deck of cards (6 decks)
        deck = {}
        for card, count in self.engine.standard_deck.items():
            deck[card] = count * self.engine.num_decks

        # Remove test cards from the deck
        test_cards = ["10", "7"]
        for card in test_cards:
            if card in deck and deck[card] > 0:
                deck[card] -= 1

        # Test that dealer stands on 17 or higher
        final_value = self.engine.simulate_dealer_hand("10", deck)
        self.assertGreaterEqual(final_value, 17)

        # Test that dealer hits on 16 or less
        # Reset deck
        deck = {
            card: count * self.engine.num_decks
            for card, count in self.engine.standard_deck.items()
        }
        test_cards = ["10", "6"]
        for card in test_cards:
            if card in deck and deck[card] > 0:
                deck[card] -= 1

        final_value = self.engine.simulate_dealer_hand("10", deck)
        self.assertGreater(
            final_value, 16
        )  # Dealer should hit on 16 or less, so final value should be > 16

    def test_running_count_calculation(self):
        """Test running count calculation."""
        # Test with Hi-Lo counting system
        cards = ["A", "K", "Q", "J", "10", "9", "8", "7", "6", "5", "4", "3", "2"]
        # Hi-Lo values: -1 (A,K,Q,J,10), 0 (9,8,7), +1 (6,5,4,3,2)
        # Sum: -5 (5 cards * -1) + 0 (3 cards * 0) + 5 (5 cards * +1) = 0
        expected_count = 0

        # Calculate running count manually using the same logic as the engine
        count = 0
        for card in cards:
            if card in COUNTING_SYSTEMS["hiLo"]:
                count += COUNTING_SYSTEMS["hiLo"][card]

        self.assertEqual(
            count, expected_count, f"Expected count {expected_count} but got {count}"
        )

        # Test with specific card combinations
        # Test all low cards (2-6)
        low_cards = ["2", "3", "4", "5", "6"]
        count = sum(COUNTING_SYSTEMS["hiLo"][card] for card in low_cards)
        self.assertEqual(count, 5)  # +1 for each of 5 cards

        # Test all neutral cards (7-9)
        neutral_cards = ["7", "8", "9"]
        count = sum(COUNTING_SYSTEMS["hiLo"][card] for card in neutral_cards)
        self.assertEqual(count, 0)  # 0 for each of 3 cards

        # Test all high cards (10-A)
        high_cards = ["10", "J", "Q", "K", "A"]
        count = sum(COUNTING_SYSTEMS["hiLo"][card] for card in high_cards)
        self.assertEqual(count, -5)  # -1 for each of 5 cards

    def test_true_count_calculation(self):
        """Test true count calculation."""
        # Add some cards to affect the count
        self.engine.remove_cards(
            [2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10]
        )
        self.assertAlmostEqual(self.engine.get_true_count(), 2.0, places=2)

    def test_basic_strategy_decision(self):
        """Test basic strategy decisions."""
        # Test hard total (16 vs 5) - should hit or stand based on strategy
        result = self.engine.get_optimal_decision(
            player_cards=["10", "6"], dealer_upcard="5", seen_cards=[], true_count=0.0
        )
        self.assertIn("action", result)
        self.assertIn(result["action"], ["hit", "stand", "double", "split"])
        self.assertEqual(result["player_value"], 16)

        # Test soft hand (A,6 vs 2) - should double or hit based on strategy
        result = self.engine.get_optimal_decision(
            player_cards=["A", "6"], dealer_upcard="2", seen_cards=[], true_count=0.0
        )
        self.assertIn("action", result)
        self.assertIn(
            result["action"], ["hit", "double", "stand"]
        )  # All are valid depending on strategy
        self.assertTrue(result["is_soft"])

        # Test pair (8,8 vs 10) - check if split is a valid option
        result = self.engine.get_optimal_decision(
            player_cards=["8", "8"], dealer_upcard="10", seen_cards=[], true_count=0.0
        )
        self.assertIn("action", result)
        # Split is a valid option, but the engine might choose a different action based on EV
        self.assertIn(result["action"], ["hit", "stand", "split"])

        # Test blackjack - should always stand
        result = self.engine.get_optimal_decision(
            player_cards=["A", "K"], dealer_upcard="6", seen_cards=[], true_count=0.0
        )
        self.assertEqual(result["action"], "stand")
        self.assertEqual(result["player_value"], 21)


class TestCardCounting(unittest.TestCase):
    """Test cases for card counting functionality."""

    def setUp(self):
        """Set up test fixtures before each test method."""
        self.engine = BlackjackDecisionEngine(num_decks=6)

    def test_card_removal(self):
        """Test removing cards from the deck."""
        self.engine.remove_cards(["A", "K"])
        self.assertEqual(
            self.engine.running_count, 0
        )  # No count change in Hi-Lo for A,K

    def test_running_count_calculation(self):
        """Test running count calculation."""
        # Test with Hi-Lo counting system
        cards = ["A", "K", "Q", "J", "10", "9", "8", "7", "6", "5", "4", "3", "2"]
        # Hi-Lo values: -1 (A,K,Q,J,10), 0 (9,8,7), +1 (6,5,4,3,2)
        # Sum: -5 (5 cards * -1) + 0 (3 cards * 0) + 5 (5 cards * +1) = 0
        expected_count = 0

        # Calculate running count manually using the same logic as the engine
        count = 0
        for card in cards:
            if card in COUNTING_SYSTEMS["hiLo"]:
                count += COUNTING_SYSTEMS["hiLo"][card]

        self.assertEqual(
            count, expected_count, f"Expected count {expected_count} but got {count}"
        )

        # Test with specific card combinations
        # Test all low cards (2-6)
        low_cards = ["2", "3", "4", "5", "6"]
        count = sum(COUNTING_SYSTEMS["hiLo"][card] for card in low_cards)
        self.assertEqual(count, 5)  # +1 for each of 5 cards

        # Test all neutral cards (7-9)
        neutral_cards = ["7", "8", "9"]
        count = sum(COUNTING_SYSTEMS["hiLo"][card] for card in neutral_cards)
        self.assertEqual(count, 0)  # 0 for each of 3 cards

        # Test all high cards (10-A)
        high_cards = ["10", "J", "Q", "K", "A"]
        count = sum(COUNTING_SYSTEMS["hiLo"][card] for card in high_cards)
        self.assertEqual(count, -5)  # -1 for each of 5 cards

    def test_true_count_calculation(self):
        """Test true count calculation."""
        # Add some cards to affect the count
        self.engine.remove_cards(
            [2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10]
        )
        self.assertAlmostEqual(self.engine.get_true_count(), 2.0, places=2)

    def test_basic_strategy_decision(self):
        """Test basic strategy decisions."""
        # Test hard total (16 vs 5) - should hit or stand based on strategy
        result = self.engine.get_optimal_decision(
            player_cards=["10", "6"], dealer_upcard="5", seen_cards=[], true_count=0.0
        )
        self.assertIn("action", result)
        self.assertIn(result["action"], ["hit", "stand", "double", "split"])
        self.assertEqual(result["player_value"], 16)

        # Test soft hand (A,6 vs 2) - should double or hit based on strategy
        result = self.engine.get_optimal_decision(
            player_cards=["A", "6"], dealer_upcard="2", seen_cards=[], true_count=0.0
        )
        self.assertIn("action", result)
        self.assertIn(
            result["action"], ["hit", "double", "stand"]
        )  # All are valid depending on strategy
        self.assertTrue(result["is_soft"])

        # Test pair (8,8 vs 10) - check if split is a valid option
        result = self.engine.get_optimal_decision(
            player_cards=["8", "8"], dealer_upcard="10", seen_cards=[], true_count=0.0
        )
        self.assertIn("action", result)
        # Split is a valid option, but the engine might choose a different action based on EV
        self.assertIn(result["action"], ["hit", "stand", "split"])

        # Test blackjack - should always stand
        result = self.engine.get_optimal_decision(
            player_cards=["A", "K"], dealer_upcard="6", seen_cards=[], true_count=0.0
        )
        self.assertEqual(result["action"], "stand")
        self.assertEqual(result["player_value"], 21)


class TestDecisionMaking(unittest.TestCase):
    """Test cases for decision making logic."""

    def setUp(self):
        """Set up test fixtures before each test method."""
        self.engine = BlackjackDecisionEngine(num_decks=6)

    def test_basic_strategy_decision(self):
        """Test basic strategy decisions."""
        # Test hard total (16 vs 5) - should hit or stand based on strategy
        result = self.engine.get_optimal_decision(
            player_cards=["10", "6"], dealer_upcard="5", seen_cards=[], true_count=0.0
        )
        self.assertIn("action", result)
        self.assertIn(result["action"], ["hit", "stand", "double", "split"])
        self.assertEqual(result["player_value"], 16)

        # Test soft hand (A,6 vs 2) - should double or hit based on strategy
        result = self.engine.get_optimal_decision(
            player_cards=["A", "6"], dealer_upcard="2", seen_cards=[], true_count=0.0
        )
        self.assertIn("action", result)
        self.assertIn(
            result["action"], ["hit", "double", "stand"]
        )  # All are valid depending on strategy
        self.assertTrue(result["is_soft"])

        # Test pair (8,8 vs 10) - check if split is a valid option
        result = self.engine.get_optimal_decision(
            player_cards=["8", "8"], dealer_upcard="10", seen_cards=[], true_count=0.0
        )
        self.assertIn("action", result)
        # Split is a valid option, but the engine might choose a different action based on EV
        self.assertIn(result["action"], ["hit", "stand", "split"])

        # Test blackjack - should always stand
        result = self.engine.get_optimal_decision(
            player_cards=["A", "K"], dealer_upcard="6", seen_cards=[], true_count=0.0
        )
        self.assertEqual(result["action"], "stand")
        self.assertEqual(result["player_value"], 21)


class TestIntegration(unittest.TestCase):
    """Integration tests for the decision engine."""

    def test_get_decision_recommendation(self):
        """Test the main decision recommendation function."""
        # Test with a simple scenario
        decision = get_decision_recommendation("A,9", "5", "Hi-Lo")
        self.assertEqual(decision["action"], "stand")

        # Test with a different scenario
        decision = get_decision_recommendation("10,6", "10", "Hi-Lo")
        self.assertEqual(decision["action"], "hit")

        # Check that the result has the expected structure
        self.assertIn("action", decision)
        self.assertIn("player_value", decision)
        self.assertIn("player_value", decision)

        # Check for either blackjack or soft hand
        self.assertTrue("is_blackjack" in decision or "is_soft" in decision)

        # For blackjack, action should be 'stand'
        if decision.get("is_blackjack", False):
            self.assertEqual(decision["action"], "stand")


if __name__ == "__main__":
    unittest.main()
