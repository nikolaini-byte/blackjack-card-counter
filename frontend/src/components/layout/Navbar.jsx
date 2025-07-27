import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="bg-secondary-bg h-14 flex items-center px-4 border-b border-gray-800">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
          <span className="text-white font-bold">BP</span>
        </div>
        <span className="text-text-primary font-semibold">Blackjack Pro</span>
      </div>
      
      <div className="ml-auto flex items-center space-x-4">
        <button 
          className="text-text-secondary hover:text-text-primary transition-colors"
          aria-label="Settings"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
        
        <Link 
          to="/new-game" 
          className="bg-accent hover:bg-accent/90 text-white px-4 py-1.5 rounded-md text-sm font-medium transition-colors"
        >
          New Game
        </Link>
      </div>
    </nav>
  );
}
