import React from 'react';
import PropTypes from 'prop-types';

/**
 * Playing Card Component
 * 
 * Displays a playing card with proper styling based on the card's rank and suit.
 * Supports face-up and face-down states, as well as different size variants.
 */
const Card = ({
  rank,
  suit,
  faceDown = false,
  size = 'md',
  className = '',
  onClick,
  isSelected = false,
  isHighlighted = false,
  animation = 'none',
  animationDelay = 0
}) => {
  // Define size classes
  const sizeClasses = {
    xs: 'w-6 h-8 text-xs',
    sm: 'w-8 h-12 text-sm',
    md: 'w-12 h-16 text-base',
    lg: 'w-16 h-24 text-lg',
    xl: 'w-20 h-28 text-xl',
    '2xl': 'w-24 h-36 text-2xl'
  };

  // Define suit colors and symbols
  const suitInfo = {
    H: { symbol: '♥', color: 'text-red-600' }, // Hearts
    D: { symbol: '♦', color: 'text-red-600' }, // Diamonds
    C: { symbol: '♣', color: 'text-gray-900' }, // Clubs
    S: { symbol: '♠', color: 'text-gray-900' }  // Spades
  };

  // Get display rank (A,2-10,J,Q,K)
  const getDisplayRank = (r) => {
    if (r === 'A') return 'A';
    if (['J', 'Q', 'K'].includes(r)) return r;
    return r; // For 2-10
  };

  // Animation classes
  const animationClasses = {
    none: '',
    flip: 'transition-transform duration-500 [transform-style:preserve-3d] hover:[transform:rotateY(180deg)]',
    bounce: 'hover:animate-bounce',
    pulse: 'hover:animate-pulse',
    shake: 'hover:animate-shake'
  };

  // If card is face down, render the back of the card
  if (faceDown) {
    return (
      <div 
        className={`
          ${sizeClasses[size] || sizeClasses['md']}
          bg-blue-800 rounded-md border-2 border-gray-200 shadow-md
          ${animationClasses[animation] || ''}
          ${isSelected ? 'ring-2 ring-yellow-400' : ''}
          ${isHighlighted ? 'ring-2 ring-green-400' : ''}
          ${onClick ? 'cursor-pointer hover:shadow-lg' : ''}
          ${className}
        `}
        onClick={onClick}
        style={{
          background: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)',
          borderColor: '#e5e7eb',
          animationDelay: `${animationDelay}ms`
        }}
      >
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-3/4 h-3/4 bg-blue-700 rounded-sm opacity-30"></div>
        </div>
      </div>
    );
  }

  // For face-up cards
  const { symbol, color } = suitInfo[suit] || { symbol: '?', color: 'text-gray-400' };
  const displayRank = getDisplayRank(rank);

  return (
    <div 
      className={`
        ${sizeClasses[size] || sizeClasses['md']}
        bg-white rounded-md border border-gray-200 shadow-md overflow-hidden
        flex flex-col justify-between p-1
        ${animationClasses[animation] || ''}
        ${isSelected ? 'ring-2 ring-yellow-400' : ''}
        ${isHighlighted ? 'ring-2 ring-green-400' : ''}
        ${onClick ? 'cursor-pointer hover:shadow-lg' : ''}
        ${className}
      `}
      onClick={onClick}
      style={{
        animationDelay: `${animationDelay}ms`
      }}
    >
      {/* Top-left rank and suit */}
      <div className={`flex flex-col items-start ${color}`}>
        <span className="font-bold leading-none">{displayRank}</span>
        <span className="text-xs leading-none -mt-0.5">{symbol}</span>
      </div>

      {/* Center suit symbol (larger) */}
      <div className={`flex-1 flex items-center justify-center ${color}`}>
        <span className="text-2xl">{symbol}</span>
      </div>

      {/* Bottom-right rank and suit (rotated) */}
      <div className={`flex flex-col items-end ${color} transform rotate-180`}>
        <span className="font-bold leading-none">{displayRank}</span>
        <span className="text-xs leading-none -mt-0.5">{symbol}</span>
      </div>
    </div>
  );
};

Card.propTypes = {
  rank: PropTypes.oneOf(['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']),
  suit: PropTypes.oneOf(['H', 'D', 'C', 'S']),
  faceDown: PropTypes.bool,
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl', '2xl']),
  className: PropTypes.string,
  onClick: PropTypes.func,
  isSelected: PropTypes.bool,
  isHighlighted: PropTypes.bool,
  animation: PropTypes.oneOf(['none', 'flip', 'bounce', 'pulse', 'shake']),
  animationDelay: PropTypes.number
};

export default Card;
