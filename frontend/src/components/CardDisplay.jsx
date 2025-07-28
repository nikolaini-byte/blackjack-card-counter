import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { getCardColorClass, getCardAriaLabel } from '../utils/cardUtils';

/**
 * A component to display a single card with proper styling and accessibility
 */
const CardDisplay = memo(({ 
  rank, 
  source, 
  countValue, 
  onToggleVisibility, 
  isVisible = true,
  isDealerUpcard = false
}) => {
  const cardClass = `card ${getCardColorClass(countValue)} ${
    isVisible ? 'opacity-100' : 'opacity-50'
  } p-2 m-1 rounded-md transition-all duration-200 flex items-center justify-center`;

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggleVisibility();
    }
  };

  return (
    <div 
      className={cardClass}
      role="button"
      tabIndex={0}
      aria-label={getCardAriaLabel(rank, source)}
      onClick={onToggleVisibility}
      onKeyDown={handleKeyDown}
      style={{
        minWidth: '50px',
        minHeight: '70px',
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      {isVisible ? (
        <span className="text-xl font-bold">{rank}</span>
      ) : (
        <span className="text-sm">?</span>
      )}
      {isDealerUpcard && !isVisible && (
        <div className="absolute top-0 right-0 bg-yellow-400 text-black text-xs px-1 rounded-bl-md">
          Dealer
        </div>
      )}
    </div>
  );
});

CardDisplay.propTypes = {
  rank: PropTypes.string.isRequired,
  source: PropTypes.oneOf(['player', 'dealer']).isRequired,
  countValue: PropTypes.number.isRequired,
  onToggleVisibility: PropTypes.func.isRequired,
  isVisible: PropTypes.bool,
  isDealerUpcard: PropTypes.bool,
};

export default CardDisplay;
