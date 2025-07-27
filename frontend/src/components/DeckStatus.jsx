import React from 'react';
import PropTypes from 'prop-types';
import { FiInfo, FiRefreshCw } from 'react-icons/fi';
import Card from './Card';

/**
 * DeckStatus Component
 * 
 * Displays the current status of the card deck/shoe, including remaining cards,
 * deck penetration, and composition visualization.
 */
const DeckStatus = ({
  cardsRemaining = 312,
  initialDeckCount = 6,
  onReshuffle,
  className = ''
}) => {
  // Calculate deck statistics
  const totalCards = initialDeckCount * 52;
  const cardsUsed = Math.max(0, totalCards - cardsRemaining);
  const penetration = Math.min(100, Math.max(0, (cardsUsed / totalCards) * 100));
  const decksRemaining = cardsRemaining / 52;
  
  // Calculate composition (simplified for visualization)
  const highCards = Math.floor(cardsRemaining * 0.25); // 10, J, Q, K, A (5/13 ~ 38.5%)
  const mediumCards = Math.floor(cardsRemaining * 0.38); // 7, 8, 9 (3/13 ~ 23%)
  const lowCards = cardsRemaining - highCards - mediumCards; // 2, 3, 4, 5, 6 (5/13 ~ 38.5%)
  
  // Calculate the number of decks to show (up to 6)
  const maxVisibleDecks = 6;
  const deckCount = Math.min(initialDeckCount, maxVisibleDecks);
  const cardsPerDeck = 52;
  const cardsPerVisualDeck = Math.floor(cardsRemaining / deckCount);
  
  // Generate visual deck representation
  const renderDeckVisualization = () => {
    const decks = [];
    
    for (let i = 0; i < deckCount; i++) {
      const isPartial = i === deckCount - 1 && cardsRemaining % deckCount !== 0;
      const cardsInThisDeck = isPartial ? cardsRemaining % cardsPerVisualDeck + cardsPerVisualDeck : cardsPerVisualDeck;
      
      decks.push(
        <div key={i} className="relative h-24 w-16">
          {/* Deck back */}
          <div className="absolute inset-0 bg-blue-900 rounded-md border-2 border-blue-700 shadow-md">
            <div className="absolute inset-0.5 border border-blue-800 rounded-sm opacity-50"></div>
          </div>
          
          {/* Cards in deck */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white text-xs font-bold z-10">
              {isPartial ? Math.ceil(cardsInThisDeck) : cardsInThisDeck}
            </span>
          </div>
          
          {/* Deck label */}
          <div className="absolute -bottom-5 left-0 right-0 text-center text-xs text-gray-400">
            {i === 0 ? '1' : i + 1}
          </div>
        </div>
      );
    }
    
    return (
      <div className="flex items-end justify-center space-x-1">
        {decks}
      </div>
    );
  };
  
  // Get penetration color based on percentage
  const getPenetrationColor = (percent) => {
    if (percent < 50) return 'text-green-400';
    if (percent < 75) return 'text-yellow-400';
    if (percent < 90) return 'text-orange-400';
    return 'text-red-400';
  };
  
  const penetrationColor = getPenetrationColor(penetration);

  return (
    <div className={`bg-gray-800 rounded-lg p-4 shadow-md ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-white">Deck Status</h2>
        <div className="flex items-center space-x-2">
          {onReshuffle && (
            <button
              onClick={onReshuffle}
              className="p-1.5 rounded-full bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors"
              title="Reshuffle"
            >
              <FiRefreshCw className="w-4 h-4" />
            </button>
          )}
          <div className="relative group">
            <FiInfo className="w-4 h-4 text-gray-400" />
            <div className="absolute right-0 bottom-full mb-2 w-64 p-3 text-xs bg-gray-900 text-gray-300 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              <p className="mb-2">
                <strong>Deck Penetration</strong> shows how far into the shoe you are. 
                Higher penetration means more cards have been played.
              </p>
              <p className="mb-2">
                <span className="text-green-400">Green:</span> Early shoe (0-50%)
                <br />
                <span className="text-yellow-400">Yellow:</span> Mid shoe (50-75%)
                <br />
                <span className="text-orange-400">Orange:</span> Late shoe (75-90%)
                <br />
                <span className="text-red-400">Red:</span> Very late shoe (90%+)
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Deck Visualization */}
      <div className="mb-6">
        {renderDeckVisualization()}
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Cards Remaining */}
        <div className="bg-gray-900/50 p-3 rounded-lg">
          <div className="text-sm text-gray-400 mb-1">Cards Remaining</div>
          <div className="text-2xl font-bold text-white">{cardsRemaining}</div>
          <div className="text-xs text-gray-400 mt-1">
            ~{decksRemaining.toFixed(1)} decks
          </div>
        </div>
        
        {/* Deck Penetration */}
        <div className="bg-gray-900/50 p-3 rounded-lg">
          <div className="text-sm text-gray-400 mb-1">Deck Penetration</div>
          <div className="flex items-end">
            <span className={`text-2xl font-bold ${penetrationColor}`}>
              {penetration.toFixed(1)}%
            </span>
            <div className="ml-2 w-full max-w-[80px] h-2 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className={`h-full ${penetrationColor.replace('text-', 'bg-')} rounded-full`}
                style={{ width: `${penetration}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        {/* Cards Used */}
        <div className="bg-gray-900/50 p-3 rounded-lg">
          <div className="text-sm text-gray-400 mb-1">Cards Used</div>
          <div className="text-2xl font-bold text-white">{cardsUsed}</div>
          <div className="text-xs text-gray-400 mt-1">
            {Math.ceil(cardsUsed / 52)} decks
          </div>
        </div>
        
        {/* Composition */}
        <div className="bg-gray-900/50 p-3 rounded-lg">
          <div className="text-sm text-gray-400 mb-2">Approx. Composition</div>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-green-400">High (10-A)</span>
              <span>{highCards} ({Math.round((highCards / cardsRemaining) * 100)}%)</span>
            </div>
            <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500"
                style={{ width: `${(highCards / cardsRemaining) * 100}%` }}
              ></div>
            </div>
            
            <div className="flex items-center justify-between text-xs">
              <span className="text-yellow-400">Medium (7-9)</span>
              <span>{mediumCards} ({Math.round((mediumCards / cardsRemaining) * 100)}%)</span>
            </div>
            <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-yellow-500"
                style={{ width: `${(mediumCards / cardsRemaining) * 100}%` }}
              ></div>
            </div>
            
            <div className="flex items-center justify-between text-xs">
              <span className="text-blue-400">Low (2-6)</span>
              <span>{lowCards} ({Math.round((lowCards / cardsRemaining) * 100)}%)</span>
            </div>
            <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500"
                style={{ width: `${(lowCards / cardsRemaining) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Action Buttons */}
      {onReshuffle && (
        <div className="mt-4 pt-4 border-t border-gray-700 flex justify-end">
          <button
            onClick={onReshuffle}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center gap-2 transition-colors"
          >
            <FiRefreshCw className="w-4 h-4" />
            Reshuffle Decks
          </button>
        </div>
      )}
    </div>
  );
};

DeckStatus.propTypes = {
  cardsRemaining: PropTypes.number,
  initialDeckCount: PropTypes.number,
  onReshuffle: PropTypes.func,
  className: PropTypes.string
};

export default DeckStatus;
