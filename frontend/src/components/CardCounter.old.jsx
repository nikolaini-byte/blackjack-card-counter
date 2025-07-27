import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { COUNTING_SYSTEMS, calculateTrueCount, getBetRecommendation } from '../utils/countingSystems';

// Constants
const CARD_RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const CARD_VALUES = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8,
  '9': 9, '10': 10, 'J': 10, 'Q': 10, 'K': 10, 'A': 11
};

const CardCounter = () => {
  // Game state
  const [decksRemaining, setDecksRemaining] = useState(3); // Default to 3 decks
  const [inputMode, setInputMode] = useState('player'); // 'player' or 'dealer'
  const [isCalculating, setIsCalculating] = useState(false); // For Monte Carlo simulation loading state
  const [showHelp, setShowHelp] = useState(false);
  const [selectedSystem, setSelectedSystem] = useState('HILO');
  const [showSystemInfo, setShowSystemInfo] = useState(false);
  const [error, setError] = useState('');
  const [simulationResult, setSimulationResult] = useState(null);
  const [playerCardsInput, setPlayerCardsInput] = useState('');
  const [dealerCardsInput, setDealerCardsInput] = useState('');
  const [cardHistory, setCardHistory] = useState([]); // Persistent history of all cards ever played with visibility flag
  
  // Track the last input that was processed to prevent duplicates
  const [lastProcessedInputs, setLastProcessedInputs] = useState({
    player: '',
    dealer: ''
  });
  
  // Get visible player and dealer cards from history (most recent first)
  const visibleCards = useMemo(() => 
    cardHistory.filter(card => card.visible !== false),
    [cardHistory]
  );
  
  const playerCards = useMemo(() => 
    [...visibleCards].reverse().filter(card => card.source === 'player'),
    [visibleCards]
  );
  
  const dealerCards = useMemo(() => 
    [...visibleCards].reverse().filter(card => card.source === 'dealer'),
    [visibleCards]
  );
  
  // Get just the ranks for counting purposes (only from visible cards)
  const playerCardRanks = useMemo(() => 
    playerCards.map(card => card.rank),
    [playerCards]
  );
  
  const dealerCardRanks = useMemo(() => 
    dealerCards.map(card => card.rank),
    [dealerCards]
  );
  
  // Calculate deck information based on visible cards
  const totalCards = useMemo(() => Math.floor(decksRemaining * 52), [decksRemaining]);
  const remainingCards = useMemo(() => Math.max(0, totalCards - visibleCards.length), [totalCards, visibleCards.length]);
  const remainingDecks = useMemo(() => Math.max(0.1, Math.round((remainingCards / 52) * 100) / 100), [remainingCards]);
  
  // Calculate running count and card counts in a single pass
  const { runningCount, cardCounts } = useMemo(() => {
    const counts = {};
    let runningCount = 0;
    
    // Initialize all ranks to 0
    CARD_RANKS.forEach(rank => {
      counts[rank] = 0;
    });
    
    // Count visible cards and calculate running count
    visibleCards.forEach(card => {
      counts[card.rank] = (counts[card.rank] || 0) + 1;
      runningCount += COUNTING_SYSTEMS[selectedSystem]?.cardValues[card.rank] || 0;
    });
    
    return { runningCount, cardCounts: counts };
  }, [visibleCards, selectedSystem]);
  
  // Calculate true count
  const trueCount = useMemo(() => {
    return calculateTrueCount(runningCount, remainingDecks, selectedSystem);
  }, [runningCount, remainingDecks, selectedSystem]);
  
  // Alias for backward compatibility
  const decksLeft = remainingDecks;
  const currentSystem = COUNTING_SYSTEMS[selectedSystem];
  
  // Log state for debugging
  useEffect(() => {
    console.log('Card History:', cardHistory);
    console.log('Visible Cards:', visibleCards);
    console.log('Running Count:', runningCount);
    console.log('True Count:', trueCount);
    console.log('Decks Remaining:', remainingDecks);
  }, [cardHistory, visibleCards, runningCount, trueCount, remainingDecks]);
  
  // Handle simulation button click
  const handleSimulationClick = useCallback(async () => {
    if (playerCardRanks.length === 0 || dealerCardRanks.length === 0) {
      setError('Please add at least one card for both player and dealer');
      return;
    }
    
    try {
      setIsCalculating(true);
      setError('');
      
      // Calculate player and dealer hand values
      const playerValue = calculateHandValue(playerCardRanks);
      const dealerUpcard = dealerCardRanks[0]; // First dealer card is the upcard
      
      // Get bet recommendation based on true count
      const betRec = getBetRecommendation(trueCount, currentSystem);
      
      // Simulate API call with timeout (replace with actual API call)
      const result = await new Promise((resolve) => {
        setTimeout(() => {
          // Mock simulation logic - replace with actual API call
          console.log('Running simulation with:', {
            playerCards: playerCardRanks,
            playerValue,
            dealerUpcard,
            runningCount,
            trueCount,
            remainingDecks,
            system: currentSystem.id
          });
          
          // Calculate win probability based on true count and hand values
          let baseWinProb = 0.5;
          let action = 'STAND';
          
          // Adjust win probability based on true count
          baseWinProb += Math.min(0.2, Math.max(-0.2, trueCount * 0.02));
          
          // Adjust based on player's hand value vs dealer's upcard
          if (playerValue > 16) {
            baseWinProb += 0.1;
            action = 'STAND';
          } else if (playerValue < 12) {
            baseWinProb -= 0.1;
            action = 'HIT';
          }
          
          // If we have a strong true count, be more aggressive
          if (trueCount >= 2) {
            if (playerValue >= 10 && playerValue <= 11) {
              action = 'DOUBLE';
              baseWinProb += 0.05;
            } else if (playerValue === 9 && [3, 4, 5, 6].includes(valueMap[dealerUpcard] || 0)) {
              action = 'DOUBLE';
              baseWinProb += 0.03;
            }
          }
          
          // Ensure win probability stays within bounds
          const winProbability = Math.min(0.95, Math.max(0.05, baseWinProb));
          
          // Calculate confidence based on sample size and true count magnitude
          const confidence = Math.min(0.95, 0.6 + Math.min(0.25, Math.abs(trueCount) * 0.05));
          
          resolve({
            recommendedAction: action,
            confidence,
            winProbability,
            betRecommendation: betRec.text,
            betUnits: betRec.unit,
            timestamp: new Date().toISOString()
          });
        }, 1500); // Simulate network delay
      });
      
      // Update simulation result with formatted data
      setSimulationResult({
        recommendedAction: result.recommendedAction,
        confidence: Math.min(1, Math.max(0, result.confidence)),
        winProbability: Math.min(1, Math.max(0, result.winProbability)),
        betRecommendation: `${result.betUnits} ${result.betRecommendation}`,
        timestamp: result.timestamp
      });
      
    } catch (error) {
      console.error('Simulation error:', error);
      setError('Failed to run simulation. Please try again.');
    } finally {
      setIsCalculating(false);
    }
  }, [playerCardRanks, dealerCardRanks, runningCount, trueCount, remainingDecks, currentSystem]);
  
  // Helper function to calculate hand value
  const calculateHandValue = (cards) => {
    let value = 0;
    let aces = 0;
    
    for (const card of cards) {
      const rank = card.rank || card; // Handle both string and object formats
      if (rank === 'A') {
        aces += 1;
        value += 11;
      } else if (['K', 'Q', 'J'].includes(rank)) {
        value += 10;
      } else if (rank === '10') {
        value += 10;
      } else if (rank) {
        value += parseInt(rank, 10) || 0;
      }
    }
    
    // Adjust for aces
    while (value > 21 && aces > 0) {
      value -= 10;
      aces -= 1;
    }
    
    return value;
  };
  
  // Map card ranks to values for comparison
  const valueMap = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8,
    '9': 9, '10': 10, 'J': 10, 'Q': 10, 'K': 10, 'A': 11
  };
  
  // Calculate card counts for each rank
  const cardCounts = useMemo(() => {
    const counts = {};
    CARD_RANKS.forEach(rank => {
      counts[rank] = cardHistory.filter(card => card.visible && card.rank === rank).length;
    });
    return counts;
  }, [cardHistory]);
  
  // Calculate expected vs actual card counts
  const expectedCardCounts = useMemo(() => {
    const totalDecks = Math.ceil(decksRemaining + (visibleCards.length / 52));
    const expectedPerDeck = {
      '2': 4, '3': 4, '4': 4, '5': 4, '6': 4, '7': 4, '8': 4,
      '9': 4, '10': 16, 'J': 4, 'Q': 4, 'K': 4, 'A': 4
    };
    
    const expected = {};
    Object.entries(expectedPerDeck).forEach(([rank, count]) => {
      expected[rank] = Math.round(count * totalDecks);
    });
    
    return expected;
  }, [decksRemaining, visibleCards.length]);
  
  // Render card count summary
  const renderCardCounts = () => {
    const positiveRanks = [];
    const neutralRanks = [];
    const negativeRanks = [];
    
    CARD_RANKS.forEach(rank => {
      const count = cardCounts[rank] || 0;
      const expected = expectedCardCounts[rank] || 0;
      const diff = count - expected;
      const cardValue = currentSystem.cardValues[rank] || 0;
      
      if (cardValue > 0) {
        positiveRanks.push({ rank, count, expected, diff, value: cardValue });
      } else if (cardValue < 0) {
        negativeRanks.push({ rank, count, expected, diff, value: cardValue });
      } else {
        neutralRanks.push({ rank, count, expected, diff, value: cardValue });
      }
    });
    
    const renderCountGroup = (title, cards, colorClass) => (
      <div className="mb-4">
        <h4 className="text-sm font-medium mb-2 text-gray-300">{title}</h4>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {cards.map(({ rank, count, expected, diff, value }) => (
            <div 
              key={rank} 
              className={`p-2 rounded text-center ${colorClass} bg-opacity-20 hover:bg-opacity-30 transition-colors cursor-help`}
              title={`${rank}: ${count} seen (${diff >= 0 ? '+' : ''}${diff} from expected)\nValue: ${value >= 0 ? '+' : ''}${value}`}
            >
              <div className="text-lg font-bold">{rank}</div>
              <div className="text-xs">
                {count} / {expected}
                {diff !== 0 && (
                  <span className={`ml-1 ${diff > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ({diff >= 0 ? '+' : ''}{diff})
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
    
    return (
      <div className="mt-6 p-4 bg-gray-800/50 rounded-lg">
        <h3 className="text-lg font-semibold mb-3 text-center">Card Counts</h3>
        
        {renderCountGroup('High Cards (Negative Count)', negativeRanks, 'bg-red-900/30')}
        {renderCountGroup('Neutral Cards', neutralRanks, 'bg-gray-700/30')}
        {renderCountGroup('Low Cards (Positive Count)', positiveRanks, 'bg-green-900/30')}
        
        <div className="mt-2 text-xs text-gray-400 text-center">
          Shows: Cards seen / Expected in {Math.ceil(decksRemaining + (visibleCards.length / 52))} decks
        </div>
      </div>
    );
  };

  // Add a card to the history
  const addCardToHistory = useCallback((rank, source = 'player') => {
    if (!CARD_RANKS.includes(rank)) {
      setError(`Ungültige Karte: ${rank}`);
      return;
    }
    
    const newCard = {
      id: Date.now() + Math.random().toString(36).substr(2, 9), // More unique ID
      rank,
      source: inputMode, // 'player' or 'dealer'
      timestamp: new Date().toISOString(),
      visible: true
    };
    
    setCardHistory(prev => [...prev, newCard]);
    setError('');
    
    // Log for debugging
    console.log('Added card:', newCard);
  }, [inputMode]);
  
  // Toggle card visibility instead of removing
  const toggleCardVisibility = useCallback((cardId) => {
    setCardHistory(prev => 
      prev.map(card => 
        card.id === cardId 
          ? { ...card, visible: !card.visible }
          : card
      )
    );
    
    // Log for debugging
    console.log('Toggled visibility for card ID:', cardId);
  }, []);

  // Validate if a card rank is valid
  const isValidCard = (card) => {
    if (!card || !card.trim()) return false;
    
    const validRanks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    let rank = card.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    
    if (rank.startsWith('10')) {
      rank = '10';
    } else {
      rank = rank.charAt(0);
    }
    
    return validRanks.includes(rank) ? rank : null;
  };

  // Parse card string into array of card objects, only using ranks
  const parseCards = useCallback((input, source) => {
    if (!input || !input.trim()) return [];
    
    try {
      // First, validate all cards in the input
      const cards = input.split(/[,\s]+/)
        .filter(card => card.trim().length > 0);
      
      // Check for any invalid cards
      const invalidCards = [];
      const validCards = [];
      
      cards.forEach(card => {
        const validCard = isValidCard(card);
        if (!validCard) {
          invalidCards.push(card);
        } else {
          validCards.push({
            rank: validCard,
            source,
            timestamp: Date.now(),
            id: `${source}-${validCard}-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`
          });
        }
      });
      
      if (invalidCards.length > 0) {
        setError(`Ungültige Karte(n): ${invalidCards.join(', ')}. Gültige Karten: 2-10, J, Q, K, A`);
      }
      
      return validCards;
    } catch (error) {
      console.error('Error parsing cards:', error);
      setError('Fehler beim Verarbeiten der Karten. Bitte versuche es erneut.');
      return [];
    }
  }, [setError]);
  
  // Process new cards from inputs and add them to history
  const processNewCards = (input, source) => {
    // Clear any previous errors
    setError('');
    
    const newCards = parseCards(input, source);
    
    // Only update if we have valid cards
    if (newCards.length > 0) {
      setCardHistory(prevHistory => {
        // Add all new cards with visibility flag
        const newCardsWithVisibility = newCards.map(card => ({
          ...card,
          visible: true,
          id: `${source}-${card.rank}-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`
        }));
        
        return [...prevHistory, ...newCardsWithVisibility];
      });
      
      // Clear the input field after processing
      if (source === 'player') {
        setPlayerCardsInput('');
      } else {
        setDealerCardsInput('');
      }
    }
  };

    
    // Update card history with unique cards from both hands
    setCardHistory(prevHistory => {
      // Keep only cards that are still in either hand
      const remainingCards = prevHistory.filter(card => 
        newPlayerCards.some(c => c.id === card.id) || 
        newDealerCards.some(c => c.id === card.id)
      );
      
      // Add any new cards that aren't in history yet
      const allNewCards = [...newPlayerCards, ...newDealerCards];
      const newCards = allNewCards.filter(
        newCard => !remainingCards.some(card => card.id === newCard.id)
      );
      
      return [...remainingCards, ...newCards];
    });
  }, [playerCardsInput, dealerCardsInput]);
  
  // Using the playerCards, dealerCards, and cardCounts declarations from above
  
  // Calculate hand value (only using ranks, ignoring suits)
  const calculateHandValue = useCallback((hand) => {
    let value = 0;
    let aces = 0;
    
    hand.forEach(card => {
      const rank = card.rank;
      if (rank === 'A') {
        aces += 1;
        value += 11;
      } else if (['K', 'Q', 'J', '10'].includes(rank)) {
        value += 10;
      } else if (rank && !isNaN(rank)) {
        value += parseInt(rank, 10);
      }
    });
    
    // Handle aces (A can be 11 or 1)
    while (value > 21 && aces > 0) {
      value -= 10;
      aces -= 1;
    }
    
    return value;
  }, []);
  
  // Calculate hand values
  const playerHandValue = useMemo(() => calculateHandValue(playerCards), [playerCards, calculateHandValue]);
  const dealerHandValue = useMemo(() => calculateHandValue(dealerCards), [dealerCards, calculateHandValue]);
  
  // Update running count when card history changes
  useEffect(() => {
    const newCount = cardHistory.reduce((count, card) => {
      return count + (currentSystem.cardValues[card.rank] || 0);
    }, 0);
    
    setRunningCount(newCount);
    setCards(cardHistory);
  }, [cardHistory, currentSystem]);
  
  // Calculate unique card counts for display
  const uniqueCardCounts = useMemo(() => {
    const counts = {};
    cardHistory.forEach(card => {
      counts[card.rank] = (counts[card.rank] || 0) + 1;
    });
    return counts;
  }, [cardHistory]);
  
  // Calculate true count based on remaining decks
  const trueCount = useMemo(() => {
    if (remainingDecks <= 0) return 0;
    // For unbalanced systems, return running count directly
    if (!COUNTING_SYSTEMS[selectedSystem].balanced) {
      return runningCount;
    }
    // For balanced systems, calculate true count
    const tc = runningCount / remainingDecks;
    return Math.round(tc * 10) / 10; // Round to 1 decimal
  }, [runningCount, remainingDecks, selectedSystem]);

  // Get bet recommendation based on true count and system
  const betRec = useMemo(() => 
    getBetRecommendation(trueCount, selectedSystem)
  , [trueCount, selectedSystem]);

  // Loading state is no longer needed

  // Handle card input from quick buttons
  const handleCardInput = useCallback((card) => {
    // Clear any previous errors
    setError('');
    
    // Validate the card rank
    const rank = card.trim().toUpperCase();
    if (!CARD_RANKS.includes(rank)) {
      setError(`Ungültige Karte: ${card}`);
      return;
    }
    
    // Add the card to history with current input mode
    addCardToHistory(rank, inputMode);
  }, [inputMode, addCardToHistory]);
  
  // Card input is now handled through the card buttons and history

  const getCardColorClass = (value) => {
    if (value > 0) return 'bg-green-900/50 text-green-300';
    if (value < 0) return 'bg-red-900/50 text-red-300';
    return 'bg-gray-700/50';
  };

  // usedDecks and decksLeft are already defined above with useMemo

  // Render a card with proper styling and visibility toggle
  const renderCard = (card, index) => {
    if (!card.visible) return null;
    
    const cardValue = currentSystem.cardValues[card.rank] || 0;
    const isPositive = cardValue > 0;
    const isNegative = cardValue < 0;
    
    return (
      <div 
        key={card.id}
        className={`relative group inline-block w-8 h-12 md:w-10 md:h-14 mx-0.5 rounded-md flex items-center justify-center text-sm font-bold cursor-pointer transition-all hover:scale-110 ${
          isPositive ? 'bg-green-900/70 text-green-200 hover:bg-green-800/80' :
          isNegative ? 'bg-red-900/70 text-red-200 hover:bg-red-800/80' :
          'bg-white/10 text-white hover:bg-gray-600/50'
        }`}
        onClick={() => toggleCardVisibility(card.id)}
        title={`${card.rank} (${cardValue >= 0 ? '+' : ''}${cardValue}) - Click to ${card.visible ? 'hide' : 'show'}`}
      >
        {card.rank}
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">
          ×
        </div>
      </div>
    );
  };
  
  // Render simulation results with better styling
  const renderSimulationResults = () => {
    if (!simulationResult) return null;
    
    const getActionColor = (action) => {
      switch(action) {
        case 'HIT': return 'text-yellow-400';
        case 'STAND': return 'text-green-400';
        case 'DOUBLE': 
        case 'DOUBLE_OR_HIT': 
        case 'DOUBLE_OR_STAND': 
          return 'text-blue-400';
        case 'SPLIT': return 'text-purple-400';
        case 'SURRENDER':
        case 'SURRENDER_OR_HIT':
        case 'SURRENDER_OR_STAND':
          return 'text-red-400';
        default: return 'text-white';
      }
    };
    
    const formatConfidence = (confidence) => {
      const percent = Math.round(confidence * 100);
      if (percent >= 80) return 'text-green-400';
      if (percent >= 60) return 'text-yellow-400';
      return 'text-red-400';
    };
    
    return (
      <div className="mt-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700 shadow-lg">
        <h3 className="text-lg font-semibold mb-3 text-center text-white">Simulation Results</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-900/30 p-3 rounded-lg">
            <p className="text-sm text-gray-400">Recommended Action</p>
            <p className={`text-2xl font-bold ${getActionColor(simulationResult.recommendedAction)}`}>
              {simulationResult.recommendedAction.replace(/_/g, ' ')}
            </p>
          </div>
          <div className="bg-gray-900/30 p-3 rounded-lg">
            <p className="text-sm text-gray-400">Confidence</p>
            <p className={`text-2xl font-bold ${formatConfidence(simulationResult.confidence)}`}>
              {Math.round(simulationResult.confidence * 100)}%
            </p>
          </div>
          <div className="bg-gray-900/30 p-3 rounded-lg">
            <p className="text-sm text-gray-400">Win Probability</p>
            <p className={`text-2xl font-bold ${simulationResult.winProbability > 0.5 ? 'text-green-400' : 'text-red-400'}`}>
              {Math.round(simulationResult.winProbability * 100)}%
            </p>
          </div>
          <div className="bg-gray-900/30 p-3 rounded-lg">
            <p className="text-sm text-gray-400">Count Information</p>
            <p className="text-sm mt-1">
              <span className="text-gray-300">RC:</span> {runningCount > 0 ? `+${runningCount}` : runningCount}
            </p>
            <p className="text-sm">
              <span className="text-gray-300">TC:</span> {trueCount > 0 ? `+${trueCount.toFixed(1)}` : trueCount.toFixed(1)}
            </p>
          </div>
        </div>
        
        {/* Bet Recommendation */}
        {simulationResult.betRecommendation && (
          <div className="mt-4 p-3 bg-blue-900/20 rounded-lg border border-blue-800/50">
            <p className="text-sm text-blue-300 font-medium mb-1">Bet Recommendation</p>
            <p className="text-lg font-bold text-blue-100">{simulationResult.betRecommendation}</p>
          </div>
        )}
      </div>
    );
  };

  const renderCardCounts = () => {
    return (
      <div className="grid grid-cols-3 gap-2 text-xs">
        {Object.entries(uniqueCardCounts).map(([rank, count]) => (
          <div key={rank} className="p-2 bg-gray-700/30 rounded">
            <div className="font-bold">{rank}</div>
            <div>{count}</div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-6">
      <div className="max-w-2xl mx-auto bg-gray-800 rounded-xl shadow-2xl overflow-hidden" style={{ minHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
                  id="counting-system"
                  value={selectedSystem}
                  onChange={(e) => {
                    setSelectedSystem(e.target.value);
                    setCards([]);
                    setRunningCount(0);
                  }}
                  className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2 pr-8 appearance-none"
                >
                  {Object.values(COUNTING_SYSTEMS).map((system) => (
                    <option key={system.id} value={system.id}>
                      {system.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                  </svg>
                </div>
              </div>
              <button
                onClick={() => setShowSystemInfo(!showSystemInfo)}
                className="text-blue-400 hover:text-blue-300 text-sm"
                aria-label="System info"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h.01a1 1 0 100-2H10V9z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            {showSystemInfo && (
              <div className="mt-3 p-3 bg-gray-800 rounded-lg text-sm">
                <h4 className="font-semibold text-white mb-1">{currentSystem.name} System</h4>
                <p className="text-gray-300 mb-2">{currentSystem.description}</p>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="p-2 bg-green-900/30 rounded">
                    <div className="font-bold">+{Object.entries(currentSystem.cardValues).filter(([_, v]) => v > 0)[0]?.[1] || 0}</div>
                    <div>{Object.entries(currentSystem.cardValues)
                      .filter(([_, v]) => v > 0)
                      .map(([k]) => k)
                      .join(', ')}
                    </div>
                  </div>
                  <div className="p-2 bg-gray-700/30 rounded">
                    <div className="font-bold">0</div>
                    <div>{Object.entries(currentSystem.cardValues)
                      .filter(([_, v]) => v === 0)
                      .map(([k]) => k)
                      .join(', ')}
                    </div>
                  </div>
                  <div className="p-2 bg-red-900/30 rounded">
                    <div className="font-bold">{Object.entries(currentSystem.cardValues).filter(([_, v]) => v < 0)[0]?.[1] || 0}</div>
                    <div>{Object.entries(currentSystem.cardValues)
                      .filter(([_, v]) => v < 0)
                      .map(([k]) => k)
                      .join(', ')}
                    </div>
                  </div>
                </div>
                {!currentSystem.balanced && (
                  <div className="mt-2 text-xs text-yellow-300">
                    Note: This is an unbalanced system. The running count is used directly for betting.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6 flex-grow">
          {/* Card Input Section */}
          <div className="mb-6 bg-gray-900/20 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium text-gray-300">Karten eingeben</h3>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-400">Modus:</span>
                <div className="inline-flex rounded-md shadow-sm" role="group">
                  <button
                    type="button"
                    onClick={() => setInputMode('player')}
                    className={`px-3 py-1 text-sm font-medium rounded-l-md ${
                      inputMode === 'player' 
                        ? 'bg-purple-700 text-white' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    Spieler
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputMode('dealer')}
                    className={`px-3 py-1 text-sm font-medium rounded-r-md ${
                      inputMode === 'dealer' 
                        ? 'bg-blue-700 text-white' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    Dealer
                  </button>
                </div>
              </div>
            </div>
            
            {/* Card Buttons */}
            <div className="grid grid-cols-5 gap-2 mb-4">
              {CARD_RANKS.map(rank => (
                <button
                  key={rank}
                  onClick={() => addCardToHistory(rank)}
                  className={`h-12 flex items-center justify-center rounded-md font-medium text-white transition-all
                    ${inputMode === 'player' ? 'bg-purple-900/70 hover:bg-purple-800/90' : 'bg-blue-900/70 hover:bg-blue-800/90'}
                    hover:scale-105 active:scale-95`}
                >
                  {rank}
                </button>
              ))}
            </div>
            
            {/* Current Hands */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-900/30 p-3 rounded-lg">
                <h4 className="text-xs font-medium text-gray-400 mb-2">Deine Hand</h4>
                <div className="flex flex-wrap gap-1 min-h-10">
                  {playerCards.length > 0 ? (
                    playerCards.map((card, index) => (
                      <div 
                        key={card.id}
                        className="w-8 h-10 flex items-center justify-center rounded-md bg-purple-900/70 text-white text-sm font-medium"
                        onClick={() => removeCardFromHistory(card.id)}
                      >
                        {card.rank}
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500 text-sm">Keine Karten</div>
                  )}
                </div>
                <div className="mt-1 text-xs text-gray-400">
                  Wert: {playerHandValue > 0 ? playerHandValue : '-'}
                </div>
              </div>
              
              <div className="bg-gray-900/30 p-3 rounded-lg">
                <h4 className="text-xs font-medium text-gray-400 mb-2">Dealer Hand</h4>
                <div className="flex flex-wrap gap-1 min-h-10">
                  {dealerCards.length > 0 ? (
                    dealerCards.map((card, index) => (
                      <div 
                        key={card.id}
                        className="w-8 h-10 flex items-center justify-center rounded-md bg-blue-900/70 text-white text-sm font-medium"
                        onClick={() => removeCardFromHistory(card.id)}
                      >
                        {card.rank}
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500 text-sm">Keine Karten</div>
                  )}
                </div>
                <div className="mt-1 text-xs text-gray-400">
                  Wert: {dealerHandValue > 0 ? dealerHandValue : '-'}
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <button
                onClick={clearAllCards}
                className="px-3 py-1 text-xs bg-red-900/50 hover:bg-red-800/70 text-red-200 rounded transition-colors"
              >
                Alle Karten zurücksetzen
              </button>
              {isCalculating ? (
                <div className="px-4 py-2 bg-green-800/50 text-white text-sm font-medium rounded flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Berechne...
                </div>
              ) : (
                <button
                  onClick={handleSimulationClick}
                  disabled={playerCards.length === 0 || dealerCards.length === 0}
                  className={`px-4 py-2 text-white text-sm font-medium rounded transition-colors ${
                    playerCards.length > 0 && dealerCards.length > 0 
                      ? 'bg-green-700 hover:bg-green-800' 
                      : 'bg-gray-600 cursor-not-allowed'
                  }`}
                >
                  Empfohlene Aktion berechnen
                </button>
              )}
            </div>
          </div>
          
          {/* Bet Recommendation */}
          <div className="bg-gray-900/50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-300">Bet</h3>
              <span className="text-xs text-gray-400">Recommendation</span>
            </div>
            <div className="text-3xl font-bold">{betRec.unit}</div>
            <div className="text-xs text-gray-400 mt-1">{betRec.text}</div>
          </div>
          
          {/* Card History */}
          <div className="mb-6 bg-gray-900/20 p-4 rounded-lg relative group">
            <div className="absolute top-2 right-2">
              <div className="relative group">
                <button 
                  className="text-gray-400 hover:text-white text-sm w-5 h-5 flex items-center justify-center rounded-full bg-gray-800/50"
                  title="Hilfe anzeigen"
                  onClick={() => document.getElementById('cardHistoryHelp').classList.toggle('hidden')}
                >
                  ?
                </button>
                <div id="cardHistoryHelp" className="hidden absolute right-0 top-full mt-1 w-64 p-3 bg-gray-800 text-xs text-gray-300 rounded shadow-lg z-50">
                  <h4 className="font-bold mb-2">Kartenverlauf - Hilfe</h4>
                  <ul className="space-y-1">
                    <li>• Karten durch Leerzeichen oder Kommas eingeben (z.B. "A K 10" oder "A,K,10")</li>
                    <li>• Klicken Sie auf eine Karte im Verlauf, um sie zu entfernen</li>
                    <li>• Der Zähler aktualisiert sich automatisch</li>
                    <li>• Farben werden ignoriert, nur die Werte zählen</li>
                  </ul>
                  <button 
                    onClick={() => document.getElementById('cardHistoryHelp').classList.add('hidden')}
                    className="mt-2 text-blue-400 hover:text-blue-300 text-xs"
                  >
                    Schließen
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-medium text-gray-300">Kartenverlauf</h3>
              <button
                onClick={clearAllCards}
                className="text-xs bg-red-900/50 hover:bg-red-800/70 px-2 py-1 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={cardHistory.length === 0}
                title="Entfernt alle Karten aus dem Verlauf"
              >
                Alles zurücksetzen
              </button>
            </div>
            
            <div className="mb-4 p-3 bg-gray-800/30 rounded">
              <h4 className="text-xs text-gray-400 mb-2">Aktive Karten</h4>
              <div className="flex flex-wrap gap-1 min-h-8">
                {Object.entries(uniqueCardCounts).length > 0 ? (
                  Object.entries(uniqueCardCounts).map(([rank, count]) => (
                    <div key={rank} className="relative group">
                      <div className={`inline-flex items-center justify-center w-8 h-8 rounded ${
                        currentSystem.cardValues[rank] > 0 ? 'bg-green-900/50' :
                        currentSystem.cardValues[rank] < 0 ? 'bg-red-900/50' : 'bg-gray-700/50'
                      }`}>
                        <span className="text-sm">{rank}</span>
                        {count > 1 && (
                          <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                            {count}
                          </span>
                        )}
                      </div>
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {rank} ({currentSystem.cardValues[rank] >= 0 ? '+' : ''}{currentSystem.cardValues[rank]}) × {count}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 text-sm">Keine Karten gespielt</div>
                )}
              </div>
            </div>
            
            <div className="p-2 bg-gray-800/50 rounded">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs text-gray-400">Vollständiger Verlauf ({cardHistory.length})</h4>
                <div className="text-xs text-gray-500">Klicken zum Entfernen</div>
              </div>
              <div className="flex flex-wrap gap-1 min-h-8 max-h-24 overflow-y-auto p-1">
                {cardHistory.length > 0 ? (
                  [...cardHistory].reverse().map((card) => (
                    <button
                      key={card.id}
                      onClick={() => removeCardFromHistory(card.id)}
                      className="relative group transition-transform hover:scale-110 active:scale-95"
                      title={`${card.source === 'dealer' ? 'Dealer' : 'Spieler'}: ${card.rank} • ${new Date(card.timestamp).toLocaleTimeString()} (zum Entfernen klicken)`}
                    >
                      <div className={`inline-block w-6 h-6 text-xs flex items-center justify-center rounded text-xs ${
                        card.source === 'dealer' 
                          ? 'bg-blue-900/60 hover:bg-red-900/70' 
                          : 'bg-purple-900/60 hover:bg-red-900/70'
                      } transition-colors`}>
                        {card.rank}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="text-gray-500 text-sm">Keine Karten im Verlauf</div>
                )}
              </div>
            </div>
            
            <h3 className="text-sm font-medium text-gray-300 mb-3">Deck Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Number of Decks</label>
                <div className="flex items-center">
                  <button
                    onClick={() => setDecksRemaining(prev => Math.max(1, Math.floor(prev) - 1))}
                    className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-l-md transition-colors"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={decksRemaining}
                    onChange={(e) => setDecksRemaining(Math.max(1, Math.min(10, Number(e.target.value) || 1)))}
                    className="w-16 text-center bg-gray-800 border-t border-b border-gray-700 py-1 text-white"
                  />
                  <button
                    onClick={() => setDecksRemaining(prev => Math.min(10, Math.ceil(prev) + 1))}
                    className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-r-md transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
              
              <div>
                <div className="text-xs text-gray-400 mb-1">Cards in Play</div>
                <div className="text-sm">
                  {cards.length} / {totalCards} cards ({usedDecks.toFixed(1)} decks used, {remainingDecks.toFixed(1)} decks left)
                </div>
              </div>
            </div>
          </div>
          
          {/* Error message */}
          {error && (
            <p id="card-error" className="mt-2 text-sm text-red-400">
              <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </p>
          )}
          
          {/* Quick Buttons */}
          <div className="grid grid-cols-5 gap-2 mt-3">
            {Object.entries(currentSystem.cardValues).map(([card]) => (
              <button
                key={card}
                onClick={() => handleCardInput(card)}
                className={`px-2 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 ${
                  getCardColorClass(currentSystem.cardValues[card])
                }`}
              >
                {card}
              </button>
            ))}
          </div>
        </div>

        {/* Card History */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-gray-300">Kartenverlauf</h3>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const lastCard = [...cardHistory].pop();
                  if (lastCard) {
                    removeCardFromHistory(lastCard.id);
                  }
                }}
                disabled={cardHistory.length === 0}
                className="text-xs px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500"
              >
                Letzte Karte entfernen
              </button>
              <button
                onClick={clearAllCards}
                className="text-xs px-3 py-1.5 bg-red-900/50 hover:bg-red-800/50 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-red-500"
              >
                Alle zurücksetzen
              </button>
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3 min-h-20 max-h-48 overflow-y-auto">
            {cardHistory.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {cardHistory.map((card, index) => (
                  <div
                    key={card.id}
                    className={`px-2.5 py-1 rounded-md text-sm font-mono ${card.source === 'player' ? 'bg-purple-900/50' : 'bg-blue-900/50'} text-white`}
                    onClick={() => removeCardFromHistory(card.id)}
                  >
                    {card.rank} ({card.source})
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm text-center py-4">
                Noch keine Karten hinzugefügt. Füge Karten über die Tasten oben hinzu.
              </p>
            )}
          </div>
        </div>
        
        {/* Help Panel */}
        {showHelp && (
          <div className="bg-gray-800 p-6 border-t border-gray-700">
            <h3 className="text-lg font-bold mb-3">Anleitung</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>• Wähle ein Kartenzählsystem aus dem Dropdown-Menü</li>
              <li>• Klicke auf die Karten, um sie zur aktuellen Hand hinzuzufügen (Spieler oder Dealer)</li>
              <li>• Nutze den Modus-Umschalter, um zwischen Spieler- und Dealer-Hand zu wechseln</li>
              <li>• Der laufende Zähler aktualisiert sich automatisch mit jeder Karte</li>
              <li>• Der True Count wird basierend auf dem ausgewählten System und den verbleibenden Decks berechnet</li>
              <li>• Klicke auf eine Karte, um sie zu entfernen</li>
              <li>• Nutze "Alle zurücksetzen", um alle Karten zu löschen</li>
            </ul>
            <div className="mt-4">
              <h4 className="font-semibold text-white mb-2">Zum Zählsystem:</h4>
              <ul className="space-y-2 text-sm">
                <li>• <span className="font-medium">Hi-Lo:</span> Ausgeglichenes System mit True Count Umrechnung</li>
                <li>• <span className="font-medium">KO:</span> Unausgeglichenes System, verwendet direkt den laufenden Zähler</li>
                <li>• <span className="font-medium">Omega II:</span> Fortgeschrittenes System mit höherer Spielgenauigkeit</li>
              </ul>
            </div>
            <button
              onClick={() => setShowHelp(false)}
              className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500"
            >
              Verstanden!
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="bg-gray-900 p-3 border-t border-gray-800 flex justify-between items-center mt-auto">
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1.5 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded px-2 py-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 3 0 011.5-2.6 1 1 0 10-1-1.73z" clipRule="evenodd" />
            </svg>
            {showHelp ? 'Hilfe ausblenden' : 'Hilfe anzeigen'}
          </button>
          <div className="text-xs text-gray-500">
            {cardHistory.length} Karten • {usedDecks.toFixed(1)} Decks verwendet • {remainingDecks.toFixed(1)} Decks übrig
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardCounter;
