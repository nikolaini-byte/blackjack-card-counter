/**
 * @typedef {Object} CardCount
 * @property {number} count - The running count of cards
 * @property {number} decks - The number of decks remaining
 * @property {number} trueCount - The true count (running count / decks remaining)
 */

/**
 * @typedef {Object} DecisionData
 * @property {string} action - The recommended action (e.g., 'HIT', 'STAND')
 * @property {string} confidence - Confidence level of the decision
 * @property {number} winProbability - Probability of winning with this decision (0-1)
 * @property {string} [explanation] - Optional explanation of the decision
 */

/**
 * @typedef {Object} GameState
 * @property {string[]} playerCards - Array of card values in player's hand
 * @property {string} dealerCard - Dealer's up card
 * @property {number} decks - Number of decks in play
 * @property {number} trueCount - Current true count
 * @property {string} mode - Current game mode ('basic' or 'advanced')
 * @property {string} [error] - Current error message, if any
 */

// Immediately Invoked Function Expression (IIFE) to create a private scope
(() => {
  // === Helper functions ===
  
  /**
   * Shorthand function to get an element by ID with type safety
   * @param {string} id - The ID of the element to retrieve
   * @returns {HTMLElement | null} The DOM element or null if not found
   */
  const el = id => document.getElementById(id);
  
  /**
   * Validates and normalizes card input strings into an array of valid card values.
   * @param {string} input - Comma-separated string of card values (e.g., 'A,10,K')
   * @returns {string[]} Array of valid card values (e.g., ['A', '10', 'K'])
   * 
   * @example
   * // Returns ['A', '10', 'K']
   * validateCards('A, 10, k');
   * 
   * // Returns [] for invalid input
   * validateCards('X,Y,Z');
   */
  function validateCards(input) {
    if (!input || typeof input !== 'string') {
      console.warn('Invalid input for validateCards:', input);
      return [];
    }
    
    // Split by comma, trim whitespace, and convert to uppercase
    const cards = input.split(',')
      .map(card => card.trim().toUpperCase())
      .filter(card => card.length > 0);
    
    // Validate each card against allowed values
    const validCardValues = new Set(['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']);
    const validCards = cards.filter(card => validCardValues.has(card));
    
    // Log any invalid cards that were filtered out
    const invalidCards = cards.filter(card => !validCardValues.has(card));
    if (invalidCards.length > 0) {
      console.warn(`Invalid card values detected and filtered: ${invalidCards.join(', ')}`);
    }
    
    return validCards;
  }
  
  /**
   * Calculates the total value of a blackjack hand, accounting for aces.
   * Aces are counted as 11 unless that would cause a bust, in which case they count as 1.
   * 
   * @param {string[]} cards - Array of card values (e.g., ['A', '10', 'K'])
   * @returns {number} The total value of the hand
   * 
   * @example
   * // Returns 21 (A=11, K=10)
   * calculateHandValue(['A', 'K']);
   * 
   * // Returns 17 (A=1, 6=6, K=10)
   * calculateHandValue(['A', '6', 'K']);
   */
  function calculateHandValue(cards) {
    // Input validation
    if (!Array.isArray(cards) || cards.length === 0) {
      console.warn('No cards provided to calculateHandValue');
      return 0;
    }
    
    let total = 0;
    let aces = 0;
    
    // First pass: count all cards, treating aces as 11
    for (const card of cards) {
      if (card === 'A') {
        aces++;
        total += 11;
      } else if (['J', 'Q', 'K'].includes(card)) {
        total += 10; // Face cards are worth 10
      } else if (card === '10' || (parseInt(card) >= 2 && parseInt(card) <= 9)) {
        total += parseInt(card);
      } else {
        console.warn(`Invalid card value in calculateHandValue: ${card}`);
      }
    }
    
    // Second pass: adjust for aces if needed
    while (total > 21 && aces > 0) {
      total -= 10; // Convert an ace from 11 to 1
      aces--;
    }
    
    return total;
  }
  
  /**
   * Converts a card value to its numerical equivalent in blackjack.
   * Face cards (J, Q, K) are worth 10, Aces are worth 11, number cards keep their face value.
   * 
   * @param {string} card - The card value to convert (e.g., 'A', '10', 'K')
   * @returns {number} The numerical value of the card
   * 
   * @example
   * // Returns 10
   * convertCardToValue('K');
   * 
   * // Returns 11
   * convertCardToValue('A');
   */
  function convertCardToValue(card) {
    if (['J', 'Q', 'K'].includes(card)) return 10;
    if (card === 'A') return 11;
    
    const value = parseInt(card, 10);
    if (isNaN(value) || value < 2 || value > 10) {
      console.warn(`Invalid card value in convertCardToValue: ${card}`);
      return 0;
    }
    return value;
  }
  
  /**
   * Calculates the true count based on the number of decks remaining.
   * The true count is the running count divided by the number of decks remaining.
   * 
   * @param {number} runningCount - The current running count
   * @param {number} decksRemaining - The number of decks remaining in the shoe
   * @returns {number} The calculated true count, rounded to 1 decimal place
   * 
   * @example
   * // Returns 2.0 (running count 4, 2 decks remaining)
   * calculateTrueCount(4, 2);
   */
  function calculateTrueCount(runningCount, decksRemaining) {
    if (typeof runningCount !== 'number' || isNaN(runningCount)) {
      console.warn('Invalid running count:', runningCount);
      return 0;
    }
    
    if (typeof decksRemaining !== 'number' || isNaN(decksRemaining) || decksRemaining <= 0) {
      console.warn('Invalid decks remaining:', decksRemaining);
      return runningCount; // Return running count as fallback
    }
    
    const trueCount = runningCount / decksRemaining;
    return Math.round(trueCount * 10) / 10; // Round to 1 decimal place
  }
  
  /**
   * Determines the CSS class name based on the count value for styling purposes.
   * 
   * @param {number} count - The count value (positive, negative, or zero)
   * @returns {'positive'|'negative'|'neutral'} The corresponding CSS class name
   * 
   * @example
   * // Returns 'positive'
   * getCountClass(5);
   * 
   * // Returns 'negative'
   * getCountClass(-3);
   * 
   * // Returns 'neutral'
   * getCountClass(0);
   */
  function getCountClass(count) {
    if (typeof count !== 'number' || isNaN(count)) {
      console.warn('Invalid count value:', count);
      return 'neutral';
    }
    
    const EPSILON = 0.001; // To handle floating point imprecision
    if (count > EPSILON) return 'positive';
    if (count < -EPSILON) return 'negative';
    return 'neutral';
  }
  
  function generateRecommendation(value, dealerVal, trueCount) {
    const action = calculateOptimalAction(value, dealerVal, trueCount);
    const risk = calculateRiskLevel(value, dealerVal, trueCount);
    
    // Generate recommendation text based on action and risk
    let recommendation = '';
    
    if (gameState.language === 'en') {
      switch(action) {
        case 'hit': recommendation = `Hit - Take another card (Risk: ${risk})`; break;
        case 'stand': recommendation = `Stand - Keep current hand (Risk: ${risk})`; break;
        case 'double': recommendation = `Double Down - Double bet and take one card (Risk: ${risk})`; break;
        case 'split': recommendation = `Split - Separate pairs into two hands (Risk: ${risk})`; break;
        default: recommendation = `${action} (Risk: ${risk})`;
      }
    } else {
      switch(action) {
        case 'hit': recommendation = `Ziehen - Weitere Karte nehmen (Risiko: ${risk})`; break;
        case 'stand': recommendation = `Stehen bleiben - Aktuelle Hand behalten (Risiko: ${risk})`; break;
        case 'double': recommendation = `Verdoppeln - Einsatz verdoppeln und eine Karte (Risiko: ${risk})`; break;
        case 'split': recommendation = `Teilen - Paare in zwei Hände aufteilen (Risiko: ${risk})`; break;
        default: recommendation = `${action} (Risiko: ${risk})`;
      }
    }
    
    return recommendation;
  }
  
  // === Basic configuration ===
  const CONFIG = {
    cardValues: ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'],
    defaultDecks: 3,
    defaultMethod: 'hiLo',
    updateInterval: 5000
  };

  // === Game state ===
  const gameState = {
    language: 'de',
    method: CONFIG.defaultMethod,
    runningCount: 0,
    history: [],
    mode: 'training',
    currentStrategy: null
  };

  // === Counting systems ===
  const countSystems = {
    hiLo: card => {
      if(['2','3','4','5','6'].includes(card)) return 1;
      if(['10','J','Q','K','A'].includes(card)) return -1;
      return 0;
    },
    ko: card => {
      if(['2','3','4','5','6','7'].includes(card)) return 1;
      if(['10','J','Q','K','A'].includes(card)) return -1;
      return 0;
    },
    omega2: card => {
      if(['2','3'].includes(card)) return 1;
      if(['4','5','6'].includes(card)) return 2;
      if(['7'].includes(card)) return 1;
      if(['9'].includes(card)) return -1;
      if(['10','J','Q','K','A'].includes(card)) return -2;
      return 0;
    },
    halves: card => {
      // Wong Halves system (fractional values)
      if(['2'].includes(card)) return 0.5;
      if(['3','4'].includes(card)) return 1;
      if(['5'].includes(card)) return 1.5;
      if(['6'].includes(card)) return 1;
      if(['7'].includes(card)) return 0.5;
      if(['8'].includes(card)) return 0;
      if(['9'].includes(card)) return -0.5;
      if(['10','J','Q','K','A'].includes(card)) return -1;
      return 0;
    },
    zenCount: card => {
      // Zen Count system
      if(['2','3'].includes(card)) return 1;
      if(['4','5','6'].includes(card)) return 2;
      if(['7'].includes(card)) return 1;
      if(['8','9'].includes(card)) return 0;
      if(['10','J','Q','K'].includes(card)) return -2;
      if(['A'].includes(card)) return -1;
      return 0;
    }
  };

  // === Advanced decision logic ===
  function getAdvancedDecision(playerCards, dealerCard, trueCount) {
    const value = calculateHandValue(playerCards);
    const dealerVal = convertCardToValue(dealerCard);

    return {
      action: calculateOptimalAction(value, dealerVal, trueCount),
      risk: calculateRiskLevel(value, dealerVal, trueCount),
      recommendation: generateRecommendation(value, dealerVal, trueCount),
      probability: calculateWinProbability(value, dealerVal, trueCount)
    };
  }

  function calculateOptimalAction(value, dealerVal, trueCount) {
    // Pair splitting logic
    if (isPair(value)) {
      return calculatePairDecision(value/2, dealerVal, trueCount);
    }
    
    // Soft hands (with Ace)
    if (hasSoftAce(value)) {
      return calculateSoftHandDecision(value, dealerVal, trueCount);
    }

    // Hard hands
    return calculateHardHandDecision(value, dealerVal, trueCount);
  }

  function calculateHardHandDecision(value, dealerVal, trueCount) {
    // Always stand on 17+
    if (value >= 17) return 'Stand';
    
    // Critical 16
    if (value === 16) {
      if (dealerVal >= 7) {
        // Stand on high count against strong dealer
        return trueCount >= 4 ? 'Stand' : 'Hit';
      }
      return 'Stand';
    }
    
    // 15 against strong dealer
    if (value === 15) {
      if (dealerVal >= 7) {
        return trueCount >= 3 ? 'Stand' : 'Hit';
      }
      return 'Stand';
    }

    // Double down opportunities
    if (value === 11) {
      if (dealerVal <= 9 || trueCount >= 2) return 'Double';
      return 'Hit';
    }
    
    if (value === 10) {
      if (dealerVal <= 9 || trueCount >= 3) return 'Double';
      return 'Hit';
    }
    
    if (value === 9) {
      if (dealerVal >= 3 && dealerVal <= 6 && trueCount >= 1) return 'Double';
      return 'Hit';
    }

    // Conservative play against weak dealer
    if (value >= 13 && dealerVal <= 6) return 'Stand';
    
    // Default action
    return 'Hit';
  }

  function calculateSoftHandDecision(value, dealerVal, trueCount) {
    const hardValue = value - 11; // Remove Ace value

    if (value >= 20) return 'Stand';
    
    if (value === 19) {
      if (dealerVal === 6 && trueCount >= 4) return 'Double';
      return 'Stand';
    }
    
    if (value === 18) {
      if (dealerVal >= 2 && dealerVal <= 6) {
        return trueCount >= 2 ? 'Double' : 'Stand';
      }
      if (dealerVal >= 9) return 'Hit';
      return 'Stand';
    }
    
    if (value === 17) {
      if (dealerVal >= 3 && dealerVal <= 6) return 'Double';
      return 'Hit';
    }
    
    if (value === 16 || value === 15) {
      if (dealerVal >= 4 && dealerVal <= 6) return 'Double';
      return 'Hit';
    }
    
    if (value === 14 || value === 13) {
      if (dealerVal >= 5 && dealerVal <= 6 && trueCount >= 2) return 'Double';
      return 'Hit';
    }

    return 'Hit';
  }

  function calculatePairDecision(cardValue, dealerVal, trueCount) {
    // Always split Aces and 8s
    if (cardValue === 11 || cardValue === 8) return 'Split';
    
    // Never split 10s unless very high count
    if (cardValue === 10) {
      return trueCount >= 6 ? 'Split' : 'Stand';
    }
    
    // Split 9s except against 7,10,A
    if (cardValue === 9) {
      if (![7,10,11].includes(dealerVal)) return 'Split';
      return 'Stand';
    }
    
    // Split 7s against weak dealer
    if (cardValue === 7) {
      if (dealerVal <= 7) return 'Split';
      return 'Hit';
    }
    
    // Split 6s against weak dealer
    if (cardValue === 6) {
      if (dealerVal <= 6 && trueCount >= 1) return 'Split';
      return 'Hit';
    }
    
    // Split 4s only in very specific situations
    if (cardValue === 4) {
      if (dealerVal === 5 || dealerVal === 6) return trueCount >= 3 ? 'Split' : 'Hit';
      return 'Hit';
    }
    
    // Split 2s and 3s against weak dealer
    if (cardValue === 2 || cardValue === 3) {
      if (dealerVal <= 7 && trueCount >= 0) return 'Split';
      return 'Hit';
    }

    return 'Hit';
  }

  function calculateRiskLevel(value, dealerVal, trueCount) {
    let riskScore = 0;
    
    // Risk factors
    if(value > 16) riskScore -= 2;
    if(dealerVal >= 7) riskScore += 2;
    if(trueCount >= 3) riskScore -= 1;
    
    return riskScore <= 0 ? 'low' : riskScore <= 2 ? 'medium' : 'high';
  }

  function calculateWinProbability(value, dealerVal, trueCount) {
    let baseProb = 0;
    
    // Enhanced probability calculation
    if (value >= 19) baseProb = 0.85;
    else if (value >= 17) baseProb = 0.70;
    else if (value === 16) baseProb = dealerVal >= 7 ? 0.35 : 0.60;
    else if (value >= 13) baseProb = dealerVal <= 6 ? 0.55 : 0.35;
    else if (value === 12) baseProb = dealerVal >= 4 && dealerVal <= 6 ? 0.50 : 0.30;
    else if (value === 11) baseProb = 0.65;
    else if (value === 10) baseProb = 0.55;
    else baseProb = 0.40;

    // True count influence
    const countAdjustment = trueCount * 0.03;
    
    // Dealer bust probability influence
    const dealerBustAdjustment = dealerVal >= 7 ? -0.05 : dealerVal <= 6 ? 0.07 : 0;
    
    return Math.min(Math.max(baseProb + countAdjustment + dealerBustAdjustment, 0), 1);
  }

  function isPair(value) {
    return value % 2 === 0;
  }

  function hasSoftAce(value) {
    return value > 10 && value <= 21;
  }

  // === UI Updates ===
  function updateDisplay() {
    const decks = parseFloat(el('deckInput').value || CONFIG.defaultDecks);
    const trueCount = calculateTrueCount(decks);
    updateCountDisplay(trueCount);
    updateCardsRemaining(decks);
    updateRecommendation(trueCount);
    updateHistory();
    updateAIStats(); 
  }

  function updateCountDisplay(trueCount) {
    const countDisplay = el('countDisplay');
    const trueCountDisplay = el('trueCountDisplay');
    
    countDisplay.innerHTML = `${gameState.language === 'en' ? 'Running Count: ' : 'Aktueller Count: '} 
      <span class="${getCountClass(gameState.runningCount)}">${gameState.runningCount}</span>`;
    
    // Ensure trueCount is properly rounded for display
    const roundedTrueCount = Math.round(trueCount * 10) / 10;
    trueCountDisplay.innerHTML = `True Count: 
      <span class="${getCountClass(parseFloat(roundedTrueCount))}">${roundedTrueCount}</span>`;
  }

  function updateCardsRemaining(decks) {
    const totalCards = decks * 52;
    const remainingCards = totalCards - gameState.history.length;
    const remainingDecks = (remainingCards / 52).toFixed(2);
    
    el('cardsRemainingDisplay').innerHTML = 
      `${gameState.language === 'en' ? 'Cards remaining: ' : 'Cards remaining: '} 
      ${remainingCards} (${remainingDecks} ${gameState.language === 'en' ? 'decks' : 'Decks'})`;
  }

  function createCardButtons() {
    const container = el('cardsContainer');
    container.innerHTML = ''; // Container leeren
    
    CONFIG.cardValues.forEach(card => {
      const btn = document.createElement('button');
      btn.className = 'card-btn';
      btn.textContent = card;
      
      btn.addEventListener('click', () => {
        addCard(card); 
      });
      
      container.appendChild(btn);
    });
  }

  // Make sure this is called when adding cards
  function addCard(card) {
    const val = countSystems[gameState.method](card);
    gameState.runningCount += val;
    gameState.history.push({
      card,
      value: val,
      timestamp: new Date().toISOString(),
      runningCount: gameState.runningCount
    });
    
    updateDisplay(); 
    localStorage.setItem('blackjackState', JSON.stringify(gameState));
  }

  // === Event Handler ===
  function handleReset() {
    gameState.runningCount = 0;
    gameState.history = [];
    localStorage.removeItem('blackjackState');
    updateDisplay();
  }

  function handleUndo() {
    if (gameState.history.length > 0) {
      const lastCard = gameState.history.pop();
      gameState.runningCount -= lastCard.value;
      updateDisplay();
      localStorage.setItem('blackjackState', JSON.stringify(gameState));
    }
  }

  function handleModeSwitch() {
    const btn = el('modeBtn');
    const display = el('modeDisplay');
    
    if (gameState.mode === 'training') {
      gameState.mode = 'real';
      btn.textContent = 'Trainingsmodus starten';
      display.innerHTML = 'Modus: Echtspiel <span class="mode-indicator real-mode">LIVE</span>';
    } else {
      gameState.mode = 'training';
      btn.textContent = 'Echtspielmodus starten';
      display.innerHTML = 'Modus: Training <span class="mode-indicator training-mode">TRAINING</span>';
    }
  }

  function handleMethodChange(e) {
    gameState.method = e.target.value;
    updateDisplay();
  }

  function handleExport() {
    const content = gameState.history
      .map((h, i) => `${i + 1}. ${h.card} (${h.value}) - Count: ${h.runningCount}`)
      .join('\n');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `blackjack_session_${new Date().toISOString().slice(0,10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // === Event Listener Initialization ===
  function initializeEventListeners() {
    el('resetBtn').addEventListener('click', handleReset);
    el('undoBtn').addEventListener('click', handleUndo);
    el('modeBtn').addEventListener('click', handleModeSwitch);
    el('methodSelect').addEventListener('change', handleMethodChange);
    el('exportBtn').addEventListener('click', handleExport);
    el('calcDecisionBtn').addEventListener('click', calculateDecision);
  }

  // === Backend Integration ===
  const API = {
    baseUrl: 'http://localhost:8000',
    
    async analyze(cards, dealerCard, trueCount, decks) {
      try {
        const response = await fetch(`${this.baseUrl}/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cards,
            dealer_card: dealerCard,
            true_count: trueCount,
            decks: decks
          })
        });
        return await response.json();
      } catch (error) {
        console.error('Analysis API Error:', error);
        return null;
      }
    },

    async getStrategy(playerCards, dealerCard, trueCount) {
      try {
        const response = await fetch(`${this.baseUrl}/strategy`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            player_hand: playerCards,
            dealer_card: dealerCard,
            true_count: trueCount
          })
        });
        return await response.json();
      } catch (error) {
        console.error('Strategy API Error:', error);
        return null;
      }
    }
  };

  // Extend the existing decision logic
  async function getAdvancedDecision(playerCards, dealerCard, trueCount) {
    // Local basic analysis
    const localDecision = {
      action: calculateOptimalAction(value, dealerVal, trueCount),
      risk: calculateRiskLevel(value, dealerVal, trueCount),
      probability: calculateWinProbability(value, dealerVal, trueCount)
    };

    // Backend analysis if available
    const backendAnalysis = await API.analyzeGame(playerCards, dealerCard, trueCount);
    
    if (backendAnalysis) {
      return {
        ...localDecision,
        ...backendAnalysis,
        recommendation: generateRecommendation(
          localDecision, 
          backendAnalysis
        )
      };
    }

    return localDecision;
  }

  // Update the UI update function
  async function updateDecisionDisplay() {
    const playerCards = validateCards(el('playerCardInput').value);
    const dealerCard = validateCards(el('dealerCardInput').value)[0];
    
    if(!playerCards.length || !dealerCard) return;

    const decks = parseFloat(el('deckInput').value || '1');
    const trueCount = decks > 0 ? gameState.runningCount / decks : 0;
    
    el('decisionDisplay').innerHTML = '<em>Analyzing...</em>';
    
    try {
      // Get strategy from the new mathematical engine
      const strategy = gameState.currentStrategy;
      
      if (strategy) {
        const isGerman = gameState.language === 'de';
        const actionText = isGerman ? strategy.recommendation.text_de : strategy.recommendation.text_en;
        
        // Determine risk level based on expected value
        let riskClass = 'low';
        if (strategy.expected_value > 0.01) riskClass = 'high';
        else if (strategy.expected_value > -0.01) riskClass = 'medium';
        
        let display = `
          <div class="decision ${riskClass}">
            <h3>${isGerman ? 'Mathematische Empfehlung' : 'Mathematical Recommendation'}</h3>
            <p class="action">${actionText}</p>
            <p class="expected-value">
              ${isGerman ? 'Erwartungswert' : 'Expected Value'}: ${(strategy.expected_value * 100).toFixed(2)}%
            </p>
            <p class="confidence">
              ${isGerman ? 'Konfidenz' : 'Confidence'}: ${strategy.recommendation.confidence_level}
            </p>
            ${strategy.bust_probability > 0 ? `
              <p class="bust-prob">
                ${isGerman ? 'Bust-Wahrscheinlichkeit' : 'Bust Probability'}: ${(strategy.bust_probability * 100).toFixed(1)}%
              </p>
            ` : ''}
            <p class="reasoning">${strategy.reasoning}</p>
            
            <details class="advanced-info">
              <summary>${isGerman ? 'Erweiterte Analyse' : 'Advanced Analysis'}</summary>
              <div class="ev-breakdown">
                <h4>${isGerman ? 'Erwartungswerte aller Aktionen' : 'Expected Values for All Actions'}:</h4>
                ${Object.entries(strategy.all_expected_values).map(([action, ev]) => `
                  <div class="ev-item ${action === strategy.action ? 'optimal' : ''}">
                    <span class="action-name">${action.toUpperCase()}</span>
                    <span class="ev-value">${(ev * 100).toFixed(2)}%</span>
                  </div>
                `).join('')}
              </div>
              <div class="hand-info">
                <p>${isGerman ? 'Handwert' : 'Hand Value'}: ${strategy.player_value} ${strategy.is_soft ? '(soft)' : '(hard)'}</p>
                <p>${isGerman ? 'Dealer Karte' : 'Dealer Card'}: ${strategy.dealer_upcard_value}</p>
                <p>${isGerman ? 'True Count' : 'True Count'}: ${strategy.true_count.toFixed(1)}</p>
              </div>
            </details>
          </div>
        `;
        
        el('decisionDisplay').innerHTML = display;
      } else {
        el('decisionDisplay').innerHTML = '<em>Strategy analysis failed</em>';
      }
    } catch (error) {
      console.error('Strategy analysis error:', error);
      el('decisionDisplay').innerHTML = '<em>Error analyzing strategy</em>';
    }
  }

  async function updateAIStats() {
    if (gameState.history.length === 0) return;
    
    try {
      const dealerCard = el('dealerCardInput').value || 'A';
      const decks = parseFloat(el('deckInput').value || CONFIG.defaultDecks);
      const trueCount = calculateTrueCount(decks);
      
      const response = await fetch(`${API.baseUrl}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cards: gameState.history.map(h => h.card),
          dealer_card: dealerCard,
          true_count: trueCount,
          decks: decks,
          counting_system: gameState.method
        })
      });
      
      if (!response.ok) throw new Error('Network response was not ok');
      
      const data = await response.json();
      
      // Update UI with AI analysis - fix property names to match actual API response
      if (el('winProbability')) {
        el('winProbability').textContent = 
          `${(data.statistics.probabilities.win * 100).toFixed(1)}%`;
      }
      
      if (el('dealerBustProb')) {
        el('dealerBustProb').textContent = 
          `${(data.statistics.probabilities.dealer_bust * 100).toFixed(1)}%`;
      }
      
      if (el('highCardsProb')) {
        el('highCardsProb').textContent = 
          `${(data.statistics.card_distribution.high * 100).toFixed(1)}%`;
      }
      
      if (el('lowCardsProb')) {
        el('lowCardsProb').textContent = 
          `${(data.statistics.card_distribution.low * 100).toFixed(1)}%`;
      }
      
      if (el('aiConfidence')) {
        // Use expected value as confidence indicator since confidence isn't in analyze response
        const confidence = Math.abs(data.counting_analysis.expected_value) * 100;
        el('aiConfidence').textContent = `${confidence.toFixed(1)}%`;
      }
      
      if (el('riskLevel')) {
        el('riskLevel').textContent = data.recommendations.risk_level;
      }

    } catch (error) {
      console.error('AI Analysis Error:', error);
      // Don't show error to user, just log it
    }
  }

  async function calculateDecision() {
    const playerCards = validateCards(el('playerCardInput').value);
    const dealerCard = validateCards(el('dealerCardInput').value)[0];
    
    if (!playerCards.length || !dealerCard) {
      el('decisionDisplay').innerHTML = gameState.language === 'de' ? 
        'Please enter valid cards' : 'Please enter valid cards';
      return;
    }

    const decks = parseFloat(el('deckInput').value || CONFIG.defaultDecks);
    const trueCount = calculateTrueCount(decks);
    
    // Get both analysis and strategy
    const [analysis, strategy] = await Promise.all([
      API.analyze(gameState.history.map(h => h.card), dealerCard, trueCount, decks),
      API.getStrategy(playerCards, dealerCard, trueCount)
    ]);

    // Store strategy data globally for updateDecisionDisplay to use
    gameState.currentStrategy = strategy;
    
    updateDecisionDisplay();
    updateAIStats(analysis);
  }

  function updateHistory() {
    const historyDisplay = el('historyDisplay');
    
    if (!gameState.history.length) {
      historyDisplay.innerHTML = '<em>' + 
        (gameState.language === 'en' ? 'No cards played yet' : 'No cards played yet') + 
        '</em>';
      return;
    }

    const historyHTML = gameState.history.map((entry, index) => {
      const countClass = getCountClass(entry.runningCount);
      return `
        <div class="history-entry">
          <span class="history-index">${index + 1}.</span>
          <span class="history-card">${entry.card}</span>
          <span class="history-value">(${entry.value > 0 ? '+' : ''}${entry.value})</span>
          <span class="history-count ${countClass}">Count: ${entry.runningCount}</span>
        </div>
      `;
    }).join('');

    historyDisplay.innerHTML = `
      <div class="history-container">
        <h3>${gameState.language === 'en' ? 'Card History' : 'Card History'}</h3>
        ${historyHTML}
      </div>
    `;
  }

  function translateAction(action) {
    if (gameState.language === 'en') return action;
    
    // No translation needed as we're standardizing to English
    return action;
    return translations[action] || action;
  }

  // === Recommendation Update ===
  function updateRecommendation(trueCount) {
    const rec = el('recommendation');
    
    if (trueCount <= -3) {
      rec.innerHTML = '🔴 Minimum bet! Unfavorable cards.';
      rec.className = 'count-low';
    }
    else if (trueCount <= -1) {
      rec.innerHTML = '🟡 Play carefully, small bets.';
      rec.className = 'count-negative';
    }
    else if (trueCount <= 1) {
      rec.innerHTML = '⚪ Basis-Einsatz, normal spielen.';
      rec.className = 'count-neutral';
    }
    else if (trueCount <= 3) {
      rec.innerHTML = '🟢 Increase bet! Good conditions.';
      rec.className = 'count-positive';
    }
    else {
      rec.innerHTML = '✨ Maximaler Einsatz! Sehr gute Karten!';
      rec.className = 'count-high';
    }

    // English translations
    if (gameState.language === 'en') {
      if (trueCount <= -3) rec.innerHTML = '🔴 Minimum bet! Unfavorable cards.';
      else if (trueCount <= -1) rec.innerHTML = '🟡 Play carefully, small bets.';
      else if (trueCount <= 1) rec.innerHTML = '⚪ Base bet, play normal.';
      else if (trueCount <= 3) rec.innerHTML = '🟢 Increase bet! Good conditions.';
      else rec.innerHTML = '✨ Maximum bet! Very favorable cards!';
    }
  }

  // === Startup ===
  initializeEventListeners();
  createCardButtons();
  updateDisplay();
})();