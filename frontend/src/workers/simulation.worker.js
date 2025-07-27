// This runs in a Web Worker context

// Blackjack simulation logic
const BlackjackSimulator = {
  // Deck configuration
  createDeck: (decks = 6) => {
    const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    const suits = ['H', 'D', 'C', 'S'];
    let deck = [];
    
    for (let i = 0; i < decks; i++) {
      for (const suit of suits) {
        for (const rank of ranks) {
          deck.push({ rank, suit });
        }
      }
    }
    
    return this.shuffleDeck(deck);
  },
  
  shuffleDeck: (deck) => {
    const newDeck = [...deck];
    for (let i = newDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
    }
    return newDeck;
  },
  
  // Card value calculation
  getCardValue: (card, currentTotal = 0) => {
    if (['J', 'Q', 'K'].includes(card.rank)) return 10;
    if (card.rank === 'A') return currentTotal + 11 <= 21 ? 11 : 1;
    return parseInt(card.rank, 10);
  },
  
  // Hand evaluation
  evaluateHand: (cards) => {
    let total = 0;
    let aces = 0;
    
    // First pass: count non-ace cards
    for (const card of cards) {
      if (card.rank === 'A') {
        aces++;
      } else {
        total += this.getCardValue(card);
      }
    }
    
    // Second pass: handle aces
    for (let i = 0; i < aces; i++) {
      total += total + 11 <= 21 - (aces - i - 1) ? 11 : 1;
    }
    
    const isSoft = cards.some(card => card.rank === 'A') && total <= 21;
    const isBust = total > 21;
    const isBlackjack = cards.length === 2 && total === 21;
    
    return { total, isSoft, isBust, isBlackjack };
  },
  
  // Dealer's turn
  playDealerHand: (deck, upcard, holeCard) => {
    const dealerCards = [upcard, holeCard];
    let hand = this.evaluateHand(dealerCards);
    
    // Dealer stands on all 17s
    while (hand.total < 17 || (hand.total === 17 && hand.isSoft)) {
      const newCard = deck.pop();
      if (!newCard) break; // Safety check
      
      dealerCards.push(newCard);
      hand = this.evaluateHand(dealerCards);
    }
    
    return {
      cards: dealerCards,
      ...hand
    };
  },
  
  // Run a single simulation
  runSimulation: (params) => {
    const {
      playerCards = [],
      dealerUpcard = null,
      numDecks = 6,
      numSimulations = 10000,
      currentCount = 0,
      countingSystem = 'HILO',
      action = 'stand' // 'hit', 'stand', 'double', 'split'
    } = params;
    
    const results = {
      wins: 0,
      losses: 0,
      pushes: 0,
      blackjacks: 0,
      busts: 0,
      averageWin: 0,
      winDistribution: {}
    };
    
    // Card counting values for different systems
    const countingValues = {
      'HILO': { '2': 1, '3': 1, '4': 1, '5': 1, '6': 1, '7': 0, '8': 0, '9': 0, '10': -1, 'J': -1, 'Q': -1, 'K': -1, 'A': -1 },
      'KO': { '2': 1, '3': 1, '4': 1, '5': 1, '6': 1, '7': 1, '8': 0, '9': 0, '10': -1, 'J': -1, 'Q': -1, 'K': -1, 'A': -1 },
      'OMEGA_II': { '2': 1, '3': 1, '4': 2, '5': 2, '6': 2, '7': 1, '8': 0, '9': -1, '10': -2, 'J': -2, 'Q': -2, 'K': -2, 'A': 0 }
    };
    
    const countValue = countingValues[countingSystem] || countingValues['HILO'];
    
    for (let i = 0; i < numSimulations; i++) {
      // Create and shuffle deck
      let deck = this.createDeck(numDecks);
      
      // Remove known cards from the deck
      const knownCards = [...playerCards];
      if (dealerUpcard) knownCards.push(dealerUpcard);
      
      deck = deck.filter(card => 
        !knownCards.some(kc => kc.rank === card.rank && kc.suit === card.suit)
      );
      
      // Adjust deck composition based on current count
      // (This is a simplified approach; a more accurate simulation would track exact card removals)
      
      // Play out the hand based on the action
      let playerHands = [[...playerCards]];
      let finalHands = [];
      
      // Handle splitting
      if (action === 'split' && playerCards.length === 2 && 
          playerCards[0].rank === playerCards[1].rank) {
        playerHands = [
          [playerCards[0]],
          [playerCards[1]]
        ];
      }
      
      // Play out each hand
      for (let hand of playerHands) {
        // Handle hitting or doubling
        if (action === 'hit' || action === 'double') {
          const newCard = deck.pop();
          if (newCard) hand.push(newCard);
          
          // If doubled, only take one card
          if (action !== 'double') {
            // Continue hitting based on basic strategy (simplified)
            let handValue = this.evaluateHand(hand);
            while (handValue.total < 17) {
              const hitCard = deck.pop();
              if (!hitCard) break;
              hand.push(hitCard);
              handValue = this.evaluateHand(hand);
            }
          }
        }
        
        finalHands.push(hand);
      }
      
      // Play dealer's hand
      const dealerHand = this.playDealerHand(
        deck,
        dealerUpcard || deck.pop(),
        deck.pop()
      );
      
      // Evaluate results
      for (const hand of finalHands) {
        const playerHand = this.evaluateHand(hand);
        
        if (playerHand.isBust) {
          results.losses++;
          results.busts++;
        } else if (dealerHand.isBust) {
          results.wins++;
          if (playerHand.isBlackjack) results.blackjacks++;
        } else if (playerHand.total > dealerHand.total) {
          results.wins++;
          if (playerHand.isBlackjack) results.blackjacks++;
        } else if (playerHand.total < dealerHand.total) {
          results.losses++;
        } else {
          results.pushes++;
        }
      }
      
      // Update progress periodically
      if (i % 100 === 0) {
        self.postMessage({
          type: 'SIMULATION_PROGRESS',
          payload: {
            progress: (i / numSimulations) * 100,
            currentResults: {
              ...results,
              total: i + 1
            }
          }
        });
      }
      
      // Check for cancellation
      if (self.cancelSimulation) {
        self.postMessage({
          type: 'SIMULATION_CANCELLED',
          payload: {
            results: {
              ...results,
              total: i + 1,
              cancelled: true
            }
          }
        });
        return;
      }
    }
    
    // Calculate final results
    const totalHands = results.wins + results.losses + results.pushes;
    results.winRate = totalHands > 0 ? (results.wins / totalHands) * 100 : 0;
    results.pushRate = totalHands > 0 ? (results.pushes / totalHands) * 100 : 0;
    results.bustRate = totalHands > 0 ? (results.busts / totalHands) * 100 : 0;
    results.blackjackRate = totalHands > 0 ? (results.blackjacks / totalHands) * 100 : 0;
    results.totalSimulations = numSimulations;
    
    return results;
  }
};

// Handle messages from the main thread
self.onmessage = function(e) {
  const { type, payload } = e.data;
  
  switch (type) {
    case 'RUN_SIMULATION':
      try {
        const results = BlackjackSimulator.runSimulation(payload);
        if (results) {
          self.postMessage({
            type: 'SIMULATION_RESULT',
            payload: results
          });
        }
      } catch (error) {
        self.postMessage({
          type: 'SIMULATION_ERROR',
          payload: error.message
        });
      }
      break;
      
    case 'CANCEL_SIMULATION':
      self.cancelSimulation = true;
      break;
      
    default:
      break;
  }
};

// Handle errors
self.onerror = function(error) {
  self.postMessage({
    type: 'SIMULATION_ERROR',
    payload: error.message
  });
  return true; // Prevent default error handling
};
