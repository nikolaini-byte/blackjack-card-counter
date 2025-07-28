"""
Constants used throughout the Blackjack API.

This module contains all the constant values used in the application
to avoid circular imports and ensure consistency.
"""

# Card validation constants
VALID_CARDS = {"2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"}

# Counting system validation constants
VALID_COUNTING_SYSTEMS = {
    "hilo": "Hi-Lo",
    "hiopt1": "Hi-Opt I",
    "hiopt2": "Hi-Opt II",
    "ko": "Knock-Out",
    "omega2": "Omega II",
    "zen": "Zen Count",
    "halves": "Halves",
    "red7": "Red 7",
}
