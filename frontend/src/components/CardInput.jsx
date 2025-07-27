import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { FiPlus, FiX, FiInfo } from 'react-icons/fi';
import Card from './Card';

/**
 * CardInput Component
 * 
 * Provides an input field for adding cards to the game with visual feedback.
 * Supports keyboard input and shows a preview of the card being entered.
 */
const CardInput = ({
  onAddCard,
  onRemoveLastCard,
  onClearAll,
  countingSystem = 'HILO',
  className = ''
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isValid, setIsValid] = useState(true);
  const [showHelp, setShowHelp] = useState(false);
  const inputRef = useRef(null);
  
  // Card counting system values (simplified for input validation)
  const countingSystems = {
    HILO: { '2-6': '+1', '7-9': '0', '10-A': '-1' },
    KO: { '2-7': '+1', '8-9': '0', '10-A': '-1' },
    OMEGA_II: { '2-3,4-6': '+1', '7-8,9': '0', '10-J,Q-K': '-2', A: '0' }
  };

  // Focus the input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Validate card input
  const validateCard = (value) => {
    if (!value) return false;
    
    const upperValue = value.toUpperCase();
    const validRanks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const validSuits = ['H', 'D', 'C', 'S'];
    
    // Check if input is a valid rank (e.g., 'A', '10', 'K')
    const isValidRank = validRanks.includes(upperValue);
    
    // Check if input is a valid rank + suit (e.g., 'AH', '10D')
    const rank = upperValue.slice(0, -1);
    const suit = upperValue.slice(-1);
    const isValidCard = 
      validRanks.includes(rank) && 
      validSuits.includes(suit) &&
      (rank !== '1' || upperValue.startsWith('10')); // Handle '10' case
    
    return isValidRank || isValidCard;
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    
    // Validate as user types
    if (value) {
      setIsValid(validateCard(value));
    } else {
      setIsValid(true);
    }
  };

  const handleAddCard = () => {
    if (!inputValue || !isValid) return;
    
    const upperValue = inputValue.toUpperCase();
    let rank, suit;
    
    // If input is just a rank (e.g., 'A', '10'), add a default suit
    if (['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'].includes(upperValue)) {
      rank = upperValue;
      suit = 'H'; // Default to Hearts for single-letter input
    } else {
      // Extract rank and suit from input (e.g., 'AH' -> rank: 'A', suit: 'H')
      rank = upperValue.slice(0, -1);
      suit = upperValue.slice(-1);
    }
    
    onAddCard({ rank, suit });
    setInputValue('');
    setIsValid(true);
    
    // Refocus the input after adding
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && inputValue && isValid) {
      handleAddCard();
    } else if (e.key === 'Backspace' && !inputValue) {
      onRemoveLastCard();
    }
  };

  // Get the current card being entered (for preview)
  const getPreviewCard = () => {
    if (!inputValue) return null;
    
    try {
      if (validateCard(inputValue)) {
        const upperValue = inputValue.toUpperCase();
        let rank, suit;
        
        if (['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'].includes(upperValue)) {
          rank = upperValue;
          suit = 'H'; // Default to Hearts for preview
        } else {
          rank = upperValue.slice(0, -1);
          suit = upperValue.slice(-1);
        }
        
        return { rank, suit };
      }
    } catch (e) {
      console.error('Error parsing card:', e);
    }
    
    return null;
  };

  const previewCard = getPreviewCard();
  const currentSystem = countingSystems[countingSystem] || countingSystems.HILO;

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
        {/* Card Preview */}
        <div className="flex-shrink-0">
          <div className="w-16 h-24 flex items-center justify-center bg-gray-800 rounded-md border border-gray-700">
            {previewCard ? (
              <Card 
                rank={previewCard.rank} 
                suit={previewCard.suit} 
                size="lg"
                className="shadow-lg"
              />
            ) : (
              <span className="text-gray-500 text-sm">Card Preview</span>
            )}
          </div>
        </div>
        
        {/* Input and Buttons */}
        <div className="flex-grow w-full space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-grow">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Enter card (e.g., 'A', '10H', 'KD')"
                className={`
                  w-full px-4 py-2 rounded-md border bg-gray-800 text-white
                  ${!isValid && inputValue ? 'border-red-500' : 'border-gray-700'}
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  transition-all duration-200
                `}
                aria-label="Enter card"
              />
              
              {inputValue && !isValid && (
                <div className="absolute -bottom-6 left-0 text-xs text-red-400">
                  Invalid card. Example: A, 10, JD, QH
                </div>
              )}
            </div>
            
            <button
              onClick={handleAddCard}
              disabled={!inputValue || !isValid}
              className={`
                px-4 py-2 rounded-md flex items-center gap-2
                ${!inputValue || !isValid 
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'}
                transition-colors duration-200
              `}
              aria-label="Add card"
            >
              <FiPlus className="w-5 h-5" />
              <span className="hidden sm:inline">Add</span>
            </button>
            
            <button
              onClick={onRemoveLastCard}
              className="
                p-2 rounded-md bg-gray-800 hover:bg-gray-700 text-gray-300
                transition-colors duration-200
                flex items-center justify-center
              "
              aria-label="Remove last card"
              title="Remove last card"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex items-center text-xs text-gray-400">
            <button 
              onClick={() => setShowHelp(!showHelp)}
              className="flex items-center gap-1 hover:text-blue-400 transition-colors"
            >
              <FiInfo className="w-3 h-3" />
              <span>How to enter cards</span>
            </button>
            
            <span className="mx-2">•</span>
            
            <div className="flex items-center gap-1">
              <span>Count System:</span>
              <span className="font-medium">{countingSystem}</span>
            </div>
            
            <span className="mx-2">•</span>
            
            <button
              onClick={onClearAll}
              className="text-red-400 hover:text-red-300 transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>
      </div>
      
      {/* Help Section */}
      {showHelp && (
        <div className="mt-4 p-4 bg-gray-800 rounded-md border border-gray-700 text-sm">
          <h3 className="font-medium text-gray-200 mb-2">How to enter cards:</h3>
          <ul className="list-disc pl-5 space-y-1 text-gray-300">
            <li>Enter rank only (e.g., 'A', '10', 'K') for default suit (Hearts)</li>
            <li>Or enter rank + suit (e.g., 'AD' for Ace of Diamonds, '10S' for 10 of Spades)</li>
            <li>Press Enter or click Add to add the card</li>
            <li>Press Backspace with empty input to remove the last card</li>
          </ul>
          
          <div className="mt-3 pt-3 border-t border-gray-700">
            <h4 className="font-medium text-gray-200 mb-2">Current Count System ({countingSystem}):</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
              {Object.entries(currentSystem).map(([range, value]) => (
                <div key={range} className="flex items-center gap-2">
                  <span className="font-mono bg-gray-700 px-2 py-1 rounded">{range}</span>
                  <span className="text-blue-400">= {value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

CardInput.propTypes = {
  onAddCard: PropTypes.func.isRequired,
  onRemoveLastCard: PropTypes.func.isRequired,
  onClearAll: PropTypes.func.isRequired,
  countingSystem: PropTypes.oneOf(['HILO', 'KO', 'OMEGA_II']),
  className: PropTypes.string
};

export default CardInput;
