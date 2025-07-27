import React from 'react';
import { motion } from 'framer-motion';

export default function GameTable() {
  // Mock data - replace with actual game state
  const dealerCards = [
    { rank: 'A', suit: '♠', value: 11 },
    { rank: '?', suit: '?', value: 0, hidden: true }
  ];

  const playerCards = [
    { rank: '10', suit: '♥', value: 10 },
    { rank: 'K', suit: '♦', value: 10 }
  ];

  const renderCard = (card, index) => (
    <motion.div 
      key={index}
      className="playing-card"
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
    >
      {card.hidden ? (
        <div className="card-back"></div>
      ) : (
        <div className="card-front">
          <span className="rank">{card.rank}</span>
          <span className="suit">{card.suit}</span>
        </div>
      )}
    </motion.div>
  );

  return (
    <div className="h-full flex flex-col">
      {/* Dealer's Hand */}
      <div className="bg-tertiary-bg rounded-xl p-6 mb-4">
        <h2 className="text-text-secondary text-sm font-medium mb-4">Dealer's Hand</h2>
        <div className="flex space-x-2 md:space-x-4 overflow-x-auto py-2">
          {dealerCards.map((card, index) => renderCard(card, index))}
        </div>
        <div className="mt-2 text-sm text-text-secondary">
          Showing: {dealerCards[0].value} + ?
        </div>
      </div>

      {/* Game Status */}
      <div className="text-center my-4">
        <div className="inline-block bg-accent/10 text-accent text-sm font-medium px-3 py-1 rounded-full">
          Player's Turn
        </div>
      </div>

      {/* Player's Hand */}
      <div className="bg-tertiary-bg rounded-xl p-6 mt-auto">
        <h2 className="text-text-secondary text-sm font-medium mb-4">Your Hand</h2>
        <div className="flex space-x-2 md:space-x-4 overflow-x-auto py-2 mb-6">
          {playerCards.map((card, index) => renderCard(card, index))}
        </div>
        <div className="text-center text-text-secondary text-sm mb-4">
          Total: 20
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 justify-center">
          <button className="action-button bg-green-600 hover:bg-green-700">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            Stand
          </button>
          <button className="action-button bg-accent hover:bg-accent/90">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Hit
          </button>
          <button className="action-button bg-yellow-600 hover:bg-yellow-700">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Double
          </button>
          <button className="action-button bg-red-600 hover:bg-red-700">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Surrender
          </button>
        </div>
      </div>
    </div>
  );
}
