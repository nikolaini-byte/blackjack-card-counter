import React from 'react';

export default function Sidebar() {
  return (
    <aside className="w-72 bg-secondary-bg border-l border-gray-800 p-4 hidden md:block overflow-y-auto">
      <div className="space-y-6">
        {/* Game Stats */}
        <div>
          <h3 className="text-text-secondary text-xs font-semibold uppercase tracking-wider mb-2">
            Game Stats
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Deck Penetration</span>
              <span className="text-text-primary font-medium">65%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">True Count</span>
              <span className="text-green-500 font-medium">+2.5</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Running Count</span>
              <span className="text-text-primary font-medium">+15</span>
            </div>
          </div>
        </div>

        {/* Betting Info */}
        <div>
          <h3 className="text-text-secondary text-xs font-semibold uppercase tracking-wider mb-2">
            Betting
          </h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-text-secondary">Current Bet</span>
                <span className="text-text-primary font-medium">$25.00</span>
              </div>
              <div className="relative">
                <input 
                  type="range" 
                  min="5" 
                  max="500" 
                  step="5" 
                  defaultValue="25"
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div className="flex justify-between text-xs text-text-secondary mt-1">
                <span>$5</span>
                <span>$500</span>
              </div>
            </div>
            <button className="w-full bg-accent hover:bg-accent/90 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors">
              Place Bet
            </button>
          </div>
        </div>

        {/* Strategy Tips */}
        <div>
          <h3 className="text-text-secondary text-xs font-semibold uppercase tracking-wider mb-2">
            Strategy Tip
          </h3>
          <div className="bg-tertiary-bg p-3 rounded-lg">
            <p className="text-sm text-text-primary">
              With your 16 vs dealer's 7, the optimal play is to Hit. The true count of +2.5 slightly increases your chances, but not enough to change the basic strategy.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
