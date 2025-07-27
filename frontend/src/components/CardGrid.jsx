import React from 'react';
import PropTypes from 'prop-types';
import Card from './Card';

/**
 * CardGrid Component
 * 
 * Displays a collection of cards in a responsive grid layout.
 * Handles different card sizes and animations based on the number of cards.
 */
const CardGrid = ({
  cards = [],
  onCardClick,
  size = 'md',
  maxCardsPerRow = 13,
  className = '',
  emptyMessage = 'No cards to display',
  faceDown = false,
  highlightLastCard = false,
  animation = 'none'
}) => {
  // If no cards, show empty message
  if (cards.length === 0) {
    return (
      <div className={`flex items-center justify-center p-4 text-gray-500 ${className}`}>
        {emptyMessage}
      </div>
    );
  }

  // Calculate grid columns based on number of cards and max per row
  const calculateGridColumns = () => {
    const count = Math.min(cards.length, maxCardsPerRow);
    return `grid-cols-${Math.min(12, Math.max(3, count))} sm:grid-cols-${Math.min(12, Math.max(4, count))} md:grid-cols-${Math.min(12, Math.max(6, count))}`;
  };

  // Calculate card size based on number of cards
  const calculateCardSize = () => {
    if (size) return size;
    
    const count = Math.min(cards.length, maxCardsPerRow);
    if (count <= 5) return 'lg';
    if (count <= 8) return 'md';
    if (count <= 13) return 'sm';
    return 'xs';
  };

  const cardSize = calculateCardSize();
  const gridColumns = calculateGridColumns();

  return (
    <div className={`w-full overflow-x-auto`}>
      <div className={`grid ${gridColumns} gap-1 sm:gap-2 md:gap-3 w-max mx-auto`}>
        {cards.map((card, index) => {
          const isLastCard = index === cards.length - 1;
          const animationDelay = animation !== 'none' ? index * 50 : 0;
          
          return (
            <div 
              key={`${card.rank}-${card.suit}-${index}`} 
              className="flex justify-center"
            >
              <Card
                rank={card.rank}
                suit={card.suit}
                faceDown={faceDown}
                size={cardSize}
                onClick={() => onCardClick?.(card, index)}
                isHighlighted={highlightLastCard && isLastCard}
                animation={animation}
                animationDelay={animationDelay}
                className="transition-all duration-300 hover:-translate-y-1"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

CardGrid.propTypes = {
  cards: PropTypes.arrayOf(
    PropTypes.shape({
      rank: PropTypes.oneOf(['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']).isRequired,
      suit: PropTypes.oneOf(['H', 'D', 'C', 'S']).isRequired,
    })
  ),
  onCardClick: PropTypes.func,
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl', '2xl']),
  maxCardsPerRow: PropTypes.number,
  className: PropTypes.string,
  emptyMessage: PropTypes.string,
  faceDown: PropTypes.bool,
  highlightLastCard: PropTypes.bool,
  animation: PropTypes.oneOf(['none', 'flip', 'bounce', 'pulse', 'shake'])
};

export default CardGrid;
