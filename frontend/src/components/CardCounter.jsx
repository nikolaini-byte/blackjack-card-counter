import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { COUNTING_SYSTEMS, CARD_RANKS, BUTTON_LABELS, ARIA_LABELS } from '../utils/cardConstants';
import { 
  calculateRunningCount, 
  calculateTrueCount, 
  calculateHandValue, 
  getCardColorClass,
  generateCardId
} from '../utils/cardUtils';
import { saveGameState, loadGameState } from '../utils/storageUtils';
import CardDisplay from './CardDisplay';

const CardCounter = () => {
  // --- States ---
  const [state, setState] = useState(() => {
    const savedState = loadGameState();
    return {
      selectedSystem: savedState.selectedSystem || 'hilo',
      cards: savedState.cards || [],
      inputMode: 'player',
      decksRemaining: savedState.decksRemaining || 6,
      showSystemInfo: false,
      showHelp: false,
      error: null,
      isCalculating: false,
      simulationResult: null,
      betRec: { unit: '-', text: 'Keine Empfehlung' }
    };
  });

  // Destructure state for easier access
  const {
    selectedSystem,
    cards,
    inputMode,
    decksRemaining,
    showSystemInfo,
    showHelp,
    error,
    isCalculating,
    simulationResult,
    betRec
  } = state;

  // Update state and save to localStorage
  const setStateWithSave = useCallback((updates) => {
    setState(prev => {
      const newState = { ...prev, ...updates };
      saveGameState({
        selectedSystem: newState.selectedSystem,
        cards: newState.cards,
        decksRemaining: newState.decksRemaining
      });
      return newState;
    });
  }, []);

  // --- Hilfsvariablen ---
  const currentSystem = COUNTING_SYSTEMS[selectedSystem] || COUNTING_SYSTEMS['hilo'];

  // --- IDs für Karten ---
  const nextId = React.useRef(1);

  // --- Memoized Values ---
  
  // Split cards into player and dealer hands
  const [playerCards, dealerCards] = useMemo(() => {
    const player = [];
    const dealer = [];
    
    cards.forEach(card => {
      if (card.source === 'player') {
        player.push(card);
      } else {
        dealer.push(card);
      }
    });
    
    return [player, dealer];
  }, [cards]);

  // Calculate running count using utility function
  const runningCount = useMemo(() => 
    calculateRunningCount(cards, currentSystem),
    [cards, currentSystem]
  );

  // Calculate remaining decks
  const usedDecks = useMemo(() => cards.length / 52, [cards]);
  const remainingDecks = Math.max(0, decksRemaining - usedDecks);
  const totalCards = decksRemaining * 52;

  // Calculate true count using utility function
  const trueCount = useMemo(
    () => calculateTrueCount(runningCount, remainingDecks, currentSystem.balabled),
    [runningCount, remainingDecks, currentSystem.balanced]
  );

  // Calculate hand values using utility function
  const { value: playerHandValue, isSoft: isPlayerHandSoft } = useMemo(
    () => calculateHandValue(playerCards),
    [playerCards]
  );

  const { value: dealerHandValue, isSoft: isDealerHandSoft } = useMemo(
    () => calculateHandValue(dealerCards),
    [dealerCards]
  );

  // --- Card Management Functions ---

  // Add a new card to the history
  const addCardToHistory = useCallback((rank) => {
    if (!CARD_RANKS.includes(rank)) {
      setStateWithSave({ error: 'Ungültige Karte' });
      return;
    }

    // Check max cards limit
    if (cards.length >= totalCards) {
      setStateWithSave({ error: 'Maximale Anzahl Karten erreicht' });
      return;
    }

    const newCard = {
      id: generateCardId(),
      rank,
      visible: true,
      source: inputMode,
      timestamp: new Date().toISOString(),
    };

    setStateWithSave({
      cards: [...cards, newCard],
      error: null,
      simulationResult: null,
      betRec: { unit: '-', text: 'Keine Empfehlung' }
    });
  }, [cards, inputMode, totalCards, setStateWithSave]);

  // Remove a card from history
  const removeCardFromHistory = useCallback((id) => {
    setStateWithSave({
      cards: cards.filter(card => card.id !== id),
      simulationResult: null,
      betRec: { unit: '-', text: 'Keine Empfehlung' }
    });
  }, [cards, setStateWithSave]);

  // Clear all cards
  const clearAllCards = useCallback(() => {
    setStateWithSave({
      cards: [],
      error: null,
      simulationResult: null,
      betRec: { unit: '-', text: 'Keine Empfehlung' }
    });
  }, [setStateWithSave]);

  // Toggle card visibility
  const toggleCardVisibility = useCallback((id) => {
    setStateWithSave({
      cards: cards.map(card => 
        card.id === id ? { ...card, visible: !card.visible } : card
      )
    });
  }, [cards, setStateWithSave]);

  // Simulation / Empfehlung auslösen (Dummy-Implementierung)
  const handleSimulationClick = () => {
    setIsCalculating(true);
    setTimeout(() => {
      // Beispielhafte Simulationsergebnisse (kann durch echte Simulation ersetzt werden)
      setSimulationResult({
        recommendedAction: 'HIT',
        confidence: 0.75,
        winProbability: 0.48,
        betRecommendation: 'Setze 2 Einheiten',
      });
      setBetRec({ unit: '2 Einheiten', text: 'Erhöhe Einsatz' });
      setIsCalculating(false);
    }, 1000);
  };

  // Hilfsfunktion für Button Farbe
  const getCardColorClass = (value) => {
    if (value > 0) return 'bg-green-700 hover:bg-green-600 text-white';
    if (value < 0) return 'bg-red-700 hover:bg-red-600 text-white';
    return 'bg-gray-700 hover:bg-gray-600 text-white';
  };

  // --- Event Handlers ---

  const handleCardInput = useCallback((rank) => {
    addCardToHistory(rank);
  }, [addCardToHistory]);

  const handleToggleInputMode = useCallback(() => {
    setStateWithSave({
      inputMode: inputMode === 'player' ? 'dealer' : 'player'
    });
  }, [inputMode, setStateWithSave]);

  // --- Render Functions ---

  const renderCard = useCallback((card) => {
    const countValue = getCardCountValue(card.rank, currentSystem);
    const isDealerUpcard = card.source === 'dealer' && dealerCards[0]?.id === card.id;
    
    return (
      <div key={card.id} className="relative">
        <CardDisplay
          rank={card.rank}
          source={card.source}
          countValue={countValue}
          onToggleVisibility={() => toggleCardVisibility(card.id)}
          isVisible={card.visible}
          isDealerUpcard={isDealerUpcard}
        />
      </div>
    );
  }, [currentSystem, dealerCards, toggleCardVisibility]);

  const renderSimulationResults = () => {
    if (!simulationResult) return null;

    const getActionColor = (action) => {
      switch (action) {
        case 'HIT':
          return 'text-yellow-400';
        case 'STAND':
          return 'text-green-400';
        case 'DOUBLE':
        case 'DOUBLE_OR_HIT':
        case 'DOUBLE_OR_STAND':
          return 'text-blue-400';
        case 'SPLIT':
          return 'text-purple-400';
        case 'SURRENDER':
        case 'SURRENDER_OR_HIT':
        case 'SURRENDER_OR_STAND':
          return 'text-red-400';
        default:
          return 'text-white';
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
            <p
              className={`text-2xl font-bold ${
                simulationResult.winProbability > 0.5 ? 'text-green-400' : 'text-red-400'
              }`}
            >
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

  // Hilfsfunktion für Card-Farbklasse (Quick Buttons)
  const getCardColorClass = (value) => {
    if (value > 0) return 'bg-green-700 hover:bg-green-600 text-white';
    if (value < 0) return 'bg-red-700 hover:bg-red-600 text-white';
    return 'bg-gray-700 hover:bg-gray-600 text-white';
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-6">
      <div
        className="max-w-2xl mx-auto bg-gray-800 rounded-xl shadow-2xl overflow-hidden flex flex-col"
        style={{ minHeight: '90vh' }}
      >
        {/* System Auswahl & Info */}
        <div className="p-4 relative">
          <select
            id="counting-system"
            value={selectedSystem}
            onChange={(e) => {
              setSelectedSystem(e.target.value);
              setCards([]);
              setError(null);
              setSimulationResult(null);
              setBetRec({ unit: '-', text: 'Keine Empfehlung' });
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
            <svg
              className="fill-current h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
          <button
            onClick={() => setShowSystemInfo(!showSystemInfo)}
            className="text-blue-400 hover:text-blue-300 text-sm absolute right-2 top-2"
            aria-label="System info"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h.01a1 1 0 100-2H10V9z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          {showSystemInfo && (
            <div className="mt-3 p-3 bg-gray-800 rounded-lg text-sm">
              <h4 className="font-semibold text-white mb-1">{currentSystem.name} System</h4>
              <p className="text-gray-300 mb-2">{currentSystem.description}</p>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="p-2 bg-green-900/30 rounded">
                  <div className="font-bold">
                    <span className="text-green-400">Positive Karten:</span>
                  </div>
                  <ul className="list-disc pl-5">
                    {Object.entries(currentSystem.cardValues)
                      .filter(([_, v]) => v > 0)
                      .map(([rank]) => (
                        <li key={rank}>{rank}</li>
                      ))}
                  </ul>
                </div>
                <div className="p-2 bg-red-900/30 rounded">
                  <div className="font-bold">
                    <span className="text-red-400">Negative Karten:</span>
                  </div>
                  <ul className="list-disc pl-5">
                    {Object.entries(currentSystem.cardValues)
                      .filter(([_, v]) => v < 0)
                      .map(([rank]) => (
                        <li key={rank}>{rank}</li>
                      ))}
                  </ul>
                </div>
                <div className="p-2 bg-gray-700/30 rounded">
                  <div className="font-bold">Neutral Karten:</div>
                  <ul className="list-disc pl-5">
                    {Object.entries(currentSystem.cardValues)
                      .filter(([_, v]) => v === 0)
                      .map(([rank]) => (
                        <li key={rank}>{rank}</li>
                      ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
            {CARD_RANKS.map((rank) => (
              <button
                key={rank}
                onClick={() => handleCardInput(rank)}
                className={`px-2 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 ${
                  getCardColorClass(currentSystem.cardValues[rank])
                }`}
              >
                {rank}
              </button>
            ))}
          </div>

          {/* Aktive Karten */}
          <div className="mb-4 p-3 bg-gray-800/30 rounded">
            <h4 className="text-xs text-gray-400 mb-2">Aktive Karten</h4>
            <div className="flex flex-wrap gap-1 min-h-8">
              {Object.entries(uniqueCardCounts).length > 0 ? (
                Object.entries(uniqueCardCounts).map(([rank, count]) => (
                  <div key={rank} className="relative group">
                    <div
                      className={`inline-flex items-center justify-center w-8 h-8 rounded ${
                        currentSystem.cardValues[rank] > 0
                          ? 'bg-green-900/50'
                          : currentSystem.cardValues[rank] < 0
                          ? 'bg-red-900/50'
                          : 'bg-gray-700/50'
                      }`}
                    >
                      <span className="text-sm">{rank}</span>
                      {count > 1 && (
                        <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                          {count}
                        </span>
                      )}
                    </div>
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {rank} ({currentSystem.cardValues[rank] >= 0 ? '+' : ''}
                      {currentSystem.cardValues[rank]}) × {count}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-gray-500 text-sm">Keine Karten gespielt</div>
              )}
            </div>
          </div>

          {/* Vollständiger Verlauf */}
          <div className="p-2 bg-gray-800/50 rounded">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs text-gray-400">Vollständiger Verlauf ({cards.length})</h4>
              <div className="text-xs text-gray-500">Klicken zum Entfernen</div>
            </div>
            <div className="flex flex-wrap gap-1 min-h-8 max-h-24 overflow-y-auto p-1">
              {cards.length > 0 ? (
                [...cards]
                  .slice()
                  .reverse()
                  .map((card) => (
                    <button
                      key={card.id}
                      onClick={() => removeCardFromHistory(card.id)}
                      className="relative group transition-transform hover:scale-110 active:scale-95"
                      title={`${card.source === 'dealer' ? 'Dealer' : 'Spieler'}: ${
                        card.rank
                      } • ${new Date(card.timestamp).toLocaleTimeString()} (zum Entfernen klicken)`}
                    >
                      <div
                        className={`inline-block w-6 h-6 text-xs flex items-center justify-center rounded text-xs ${
                          card.source === 'dealer'
                            ? 'bg-blue-900/60 hover:bg-red-900/70'
                            : 'bg-purple-900/60 hover:bg-red-900/70'
                        } transition-colors`}
                      >
                        {card.rank}
                      </div>
                    </button>
                  ))
              ) : (
                <div className="text-gray-500 text-sm">Keine Karten im Verlauf</div>
              )}
            </div>
          </div>

          {/* Deck Information */}
          <h3 className="text-sm font-medium text-gray-300 mb-3">Deck Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Number of Decks</label>
              <div className="flex items-center">
                <button
                  onClick={() => setDecksRemaining((prev) => Math.max(1, Math.floor(prev) - 1))}
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-l-md transition-colors"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={decksRemaining}
                  onChange={(e) =>
                    setDecksRemaining(Math.max(1, Math.min(10, Number(e.target.value) || 1)))
                  }
                  className="w-16 text-center bg-gray-800 border-t border-b border-gray-700 py-1 text-white"
                />
                <button
                  onClick={() => setDecksRemaining((prev) => Math.min(10, Math.ceil(prev) + 1))}
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-r-md transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            <div>
              <div className="text-xs text-gray-400 mb-1">Cards in Play</div>
              <div className="text-sm">
                {cards.length} / {totalCards} cards ({usedDecks.toFixed(1)} decks used,{' '}
                {remainingDecks.toFixed(1)} decks left)
              </div>
            </div>
          </div>

          {/* Fehleranzeige */}
          {error && (
            <p id="card-error" className="mt-2 text-sm text-red-400 flex items-center gap-1">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
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

          {/* Verlauf Aktionen */}
          <div className="mb-6 mt-4 flex justify-between items-center">
            <button
              onClick={() => {
                const lastCard = cards[cards.length - 1];
                if (lastCard) removeCardFromHistory(lastCard.id);
              }}
              disabled={cards.length === 0}
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

          {/* Simulation */}
          <div className="flex justify-center">
            <button
              onClick={handleSimulationClick}
              disabled={isCalculating}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 rounded-md font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCalculating ? 'Berechne...' : 'Simulation starten'}
            </button>
          </div>

          {/* Simulation Ergebnisse */}
          {renderSimulationResults()}

          {/* Kartenverlauf (kleine Ansicht) */}
          <div className="mb-6 mt-6">
            <h3 className="text-sm font-medium text-gray-300 mb-2">Kartenverlauf</h3>
            <div className="bg-gray-800/50 rounded-lg p-3 min-h-20 max-h-48 overflow-y-auto">
              {cards.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {cards.map((card) => (
                    <div
                      key={card.id}
                      className={`px-2.5 py-1 rounded-md text-sm font-mono ${
                        card.source === 'player' ? 'bg-purple-900/50' : 'bg-blue-900/50'
                      } text-white cursor-pointer`}
                      onClick={() => removeCardFromHistory(card.id)}
                      title={`Karte entfernen: ${card.rank} (${card.source})`}
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

          {/* Hilfe */}
          {showHelp && (
            <div className="bg-gray-800 p-6 border-t border-gray-700 rounded-lg">
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
                  <li>
                    • <span className="font-medium">Hi-Lo:</span> Ausgeglichenes System mit True Count Umrechnung
                  </li>
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
          <div className="bg-gray-900 p-3 border-t border-gray-800 flex justify-between items-center mt-auto rounded-b-xl">
            <button
              onClick={() => setShowHelp(!showHelp)}
              className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1.5 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded px-2 py-1"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 3 0 011.5-2.6 1 1 0 10-1-1.73z"
                  clipRule="evenodd"
                />
              </svg>
              {showHelp ? 'Hilfe ausblenden' : 'Hilfe anzeigen'}
            </button>
            <div className="text-xs text-gray-500">
              {cards.length} Karten • {usedDecks.toFixed(1)} Decks verwendet • {remainingDecks.toFixed(1)} Decks übrig
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default React.memo(CardCounter);