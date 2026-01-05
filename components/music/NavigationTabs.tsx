'use client';

import { ViewType } from './types';

interface NavigationTabsProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function NavigationTabs({
  currentView,
  onViewChange,
  searchQuery,
  onSearchChange,
}: NavigationTabsProps) {
  return (
    <div className="p-4 border-b bg-gradient-to-r from-blue-500 to-purple-600">
      <h2 className="text-2xl font-bold mb-4 text-white">🎵 Music Library</h2>
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => onViewChange('artists')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            currentView === 'artists'
              ? 'bg-white text-blue-600 shadow-md'
              : 'bg-blue-600 text-white hover:bg-blue-700 border-2 border-white'
          }`}
        >
          Artists
        </button>
        <button
          onClick={() => onViewChange('playlists')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            currentView === 'playlists'
              ? 'bg-white text-blue-600 shadow-md'
              : 'bg-blue-600 text-white hover:bg-blue-700 border-2 border-white'
          }`}
        >
          Playlists
        </button>
        <button
          onClick={() => onViewChange('search')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            currentView === 'search'
              ? 'bg-white text-blue-600 shadow-md'
              : 'bg-blue-600 text-white hover:bg-blue-700 border-2 border-white'
          }`}
        >
          Search
        </button>
        <button
          onClick={() => onViewChange('queue')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            currentView === 'queue'
              ? 'bg-white text-blue-600 shadow-md'
              : 'bg-blue-600 text-white hover:bg-blue-700 border-2 border-white'
          }`}
        >
          Queue
        </button>
      </div>
      {currentView === 'search' && (
        <input
          type="text"
          placeholder="Search for songs or artists..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg text-gray-900"
        />
      )}
    </div>
  );
}
