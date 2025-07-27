import React from 'react';
import PropTypes from 'prop-types';
import { FiInfo } from 'react-icons/fi';

/**
 * CountDisplay Component
 * 
 * Displays the current running count, true count, and betting recommendations
 * with visual indicators and tooltips for better understanding.
 */
const CountDisplay = ({
  runningCount = 0,
  trueCount = 0,
  betRecommendation = { text: 'Minimum Bet', color: 'text-gray-300' },
  countingSystem = 'HILO',
  decksRemaining = 6,
  className = ''
}) => {
  // Format the count with proper sign
  const formatCount = (count) => {
    return count > 0 ? `+${count}` : count;
  };

  // Get color based on count value
  const getCountColor = (count) => {
    if (count > 0) return 'text-green-400';
    if (count < 0) return 'text-red-400';
    return 'text-gray-300';
  };

  // Get betting recommendation explanation
  const getBettingExplanation = () => {
    const absTrueCount = Math.abs(trueCount);
    
    if (trueCount >= 5) {
      return 'Very high count - Maximum bet recommended. The deck is rich in high cards, favoring the player.';
    } else if (trueCount >= 3) {
      return 'High count - Increase your bet. The deck is favorable with more high cards remaining.';
    } else if (trueCount >= 1) {
      return 'Moderate count - Slightly increase your bet. The deck is somewhat favorable.';
    } else if (trueCount >= 0) {
      return 'Neutral or slightly negative count - Minimum bet recommended. The deck is roughly balanced.';
    } else {
      return 'Negative count - Minimum bet or leave the table. The deck is rich in low cards, favoring the dealer.';
    }
  };

  // Get counting system details
  const getSystemDetails = () => {
    const systems = {
      HILO: {
        name: 'Hi-Lo',
        description: 'The most popular balanced system. Easy to learn and effective.',
        values: {
          '2-6': '+1',
          '7-9': '0',
          '10-A': '-1'
        }
      },
      KO: {
        name: 'Knock-Out (KO)',
        description: 'An unbalanced system that doesn\'t require true count conversion.',
        values: {
          '2-7': '+1',
          '8-9': '0',
          '10-A': '-1'
        }
      },
      OMEGA_II: {
        name: 'Omega II',
        description: 'A more advanced balanced system with higher playing efficiency.',
        values: {
          '2-3,4-6': '+1',
          '7,8,9': '0',
          '10-K': '-2',
          'A': '0'
        }
      }
    };

    return systems[countingSystem] || systems.HILO;
  };

  const system = getSystemDetails();
  const countColor = getCountColor(runningCount);
  const trueCountColor = getCountColor(trueCount);

  return (
    <div className={`bg-gray-800 rounded-lg p-4 shadow-md ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Running Count */}
        <div className="bg-gray-900/50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-400">Running Count</h3>
            <div className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">
              {system.name}
            </div>
          </div>
          <div className={`text-3xl font-bold ${countColor}`}>
            {formatCount(runningCount)}
          </div>
          <div className="mt-2 text-xs text-gray-400">
            Cards seen: {Math.abs(runningCount) > 0 ? (runningCount > 0 ? 'More high cards' : 'More low cards') : 'Balanced'}
          </div>
        </div>

        {/* True Count */}
        <div className="bg-gray-900/50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-400">True Count</h3>
            <div className="text-xs text-gray-500">
              ~{decksRemaining.toFixed(1)} decks left
            </div>
          </div>
          <div className={`text-3xl font-bold ${trueCountColor}`}>
            {formatCount(trueCount.toFixed(1))}
          </div>
          <div className="mt-2 text-xs text-gray-400">
            Running count / {decksRemaining.toFixed(1)} decks
          </div>
        </div>

        {/* Betting Recommendation */}
        <div className="bg-gray-900/50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-400">Bet Suggestion</h3>
            <div className="flex items-center text-xs text-gray-500">
              <span className="mr-1">TC: {formatCount(trueCount.toFixed(1))}</span>
              <div className="relative group">
                <FiInfo className="w-3.5 h-3.5" />
                <div className="absolute bottom-full right-0 mb-2 w-64 p-2 text-xs bg-gray-900 text-gray-300 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  {getBettingExplanation()}
                </div>
              </div>
            </div>
          </div>
          <div className={`text-2xl font-bold ${betRecommendation.color} flex items-center`}>
            {betRecommendation.text}
            {betRecommendation.unit && (
              <span className="ml-2 text-sm bg-gray-700 px-2 py-0.5 rounded">
                {betRecommendation.unit}
              </span>
            )}
          </div>
          <div className="mt-2 text-xs text-gray-400">
            Based on current count and system
          </div>
        </div>
      </div>

      {/* Counting System Details */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-400">
            {system.name} Counting System
          </h3>
          <span className="text-xs text-gray-500">
            {system.name === 'Hi-Lo' ? 'Balanced' : system.name === 'KO' ? 'Unbalanced' : 'Balanced'}
          </span>
        </div>
        <p className="text-sm text-gray-300 mb-3">
          {system.description}
        </p>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {Object.entries(system.values).map(([range, value]) => (
            <div key={range} className="bg-gray-900/50 p-2 rounded text-center">
              <div className="text-xs text-gray-400">{range}</div>
              <div className={`text-lg font-mono ${
                value > 0 ? 'text-green-400' : value < 0 ? 'text-red-400' : 'text-gray-300'
              }`}>
                {value > 0 ? `+${value}` : value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

CountDisplay.propTypes = {
  runningCount: PropTypes.number,
  trueCount: PropTypes.number,
  betRecommendation: PropTypes.shape({
    text: PropTypes.string,
    color: PropTypes.string,
    unit: PropTypes.string
  }),
  countingSystem: PropTypes.oneOf(['HILO', 'KO', 'OMEGA_II']),
  decksRemaining: PropTypes.number,
  className: PropTypes.string
};

export default CountDisplay;
