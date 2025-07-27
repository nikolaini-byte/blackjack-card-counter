import React from 'react';
import Navbar from './Navbar';
import GameTable from '../game/GameTable';
import Sidebar from './Sidebar';

export default function GameLayout() {
  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4">
          <GameTable />
        </main>
        <Sidebar />
      </div>
    </div>
  );
}
