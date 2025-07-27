# Blackjack Card Counter - User Guide

## Table of Contents
1. [Introduction](#introduction)
2. [Installation](#installation)
3. [Getting Started](#getting-started)
4. [User Interface Overview](#user-interface-overview)
5. [Basic Usage](#basic-usage)
6. [Advanced Features](#advanced-features)
7. [Card Counting Systems](#card-counting-systems)
8. [Troubleshooting](#troubleshooting)
9. [Frequently Asked Questions](#frequently-asked-questions)

## Introduction

The Blackjack Card Counter is a powerful tool designed to help players make optimal decisions in the game of Blackjack. It combines mathematical analysis with real-time card counting to provide accurate strategy recommendations.

## Installation

### Windows Installation
1. Download the latest installer from the [Releases](https://github.com/yourusername/blackjack-card-counter/releases) page
2. Run the installer and follow the on-screen instructions
3. Launch the application from the Start Menu or Desktop shortcut

### Running from Source
1. Ensure you have Python 3.8 or higher installed
2. Clone the repository:
   ```
   git clone https://github.com/yourusername/blackjack-card-counter.git
   cd blackjack-card-counter
   ```
3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
4. Run the application:
   ```
   python start.py
   ```

## Getting Started

1. **Launch the Application**
   - Double-click the desktop shortcut or run `start.py`

2. **Select Game Mode**
   - Choose between Practice Mode or Real Play
   - Select the number of decks (1-8)
   - Choose your preferred card counting system

3. **Start a New Shoe**
   - Click "New Shoe" to begin a new deck
   - The application will track the remaining cards

## User Interface Overview

### Main Window
- **Card Buttons**: Click to add cards to the current hand
- **Dealer's Upcard**: Click to set the dealer's visible card
- **Recommendation Panel**: Shows the optimal play based on current game state
- **Count Display**: Shows the current running count and true count
- **Action Buttons**: Undo, Reset, and other controls

### Information Panel
- **Hand Value**: Current total of player's cards
- **True Count**: The current true count value
- **Deck Penetration**: Percentage of cards remaining in the shoe
- **Optimal Bet**: Recommended bet size based on the Kelly Criterion

## Basic Usage

### Tracking a Hand
1. Click on the card buttons to add them to your hand
2. Set the dealer's upcard by clicking on the dealer card area
3. The application will automatically display the optimal play

### Common Actions
- **Hit (H)**: Take another card
- **Stand (S)**: Keep your current hand
- **Double (D)**: Double your bet and take one more card
- **Split (P)**: Split a pair into two separate hands

## Advanced Features

### Custom Strategy
- Access the settings to customize the strategy tables
- Adjust risk tolerance and playing style
- Save and load custom strategies

### Session Tracking
- Track your wins, losses, and pushes
- View detailed statistics about your play
- Export session data for further analysis

### Keyboard Shortcuts
- **1-9, 0**: Number cards (0 = 10)
- **A, J, Q, K**: Face cards and Ace
- **Space**: Toggle between player and dealer cards
- **Enter**: Confirm action
- **Esc**: Reset the current hand

## Card Counting Systems

The application supports multiple card counting systems:

### Hi-Lo System (Recommended for Beginners)
- +1: 2, 3, 4, 5, 6
- 0: 7, 8, 9
- -1: 10, J, Q, K, A

### KO (Knock-Out) System
- +1: 2, 3, 4, 5, 6, 7
- 0: 8, 9
- -1: 10, J, Q, K, A

### Omega II System
- +1: 2, 3, 7
- +2: 4, 5, 6
- -2: 9
- -1: 10, J, Q, K, A
- 0: 8

## Troubleshooting

### Common Issues
- **Application won't start**: Ensure you have the required dependencies installed
- **Incorrect recommendations**: Verify that all cards have been entered correctly
- **Count seems off**: Double-check that you've selected the correct counting system

### Getting Help
For additional support, please:
1. Check the [FAQ](#frequently-asked-questions) below
2. Search the [GitHub Issues](https://github.com/yourusername/blackjack-card-counter/issues)
3. Open a new issue if your problem hasn't been reported

## Frequently Asked Questions

### Is card counting illegal?
No, card counting is not illegal, but casinos may ask you to leave if they suspect you're counting cards.

### How accurate are the recommendations?
The recommendations are based on mathematical probabilities and are highly accurate. However, they don't guarantee wins as blackjack still involves an element of chance.

### Can I use this in a real casino?
While the application is designed for educational purposes, we recommend using it for practice only. Many casinos prohibit the use of electronic devices at the table.

### How do I reset the count?
Click the "New Shoe" button to reset the count and start a fresh deck.

### What's the difference between running count and true count?
- **Running Count**: The total of all card values seen so far
- **True Count**: Running count divided by the number of decks remaining

The true count is generally more accurate for making betting decisions.

---

For more information, please visit the [project repository](https://github.com/yourusername/blackjack-card-counter).
