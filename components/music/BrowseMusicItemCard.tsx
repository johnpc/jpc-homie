'use client';

import { JellyfinTrack } from '@/lib/jellyfin';
import { useState } from 'react';

interface BrowseMusicItemCardProps {
  track: JellyfinTrack;
}

export default function BrowseMusicItemCard({ track }: BrowseMusicItemCardProps) {
  const [showToast, setShowToast] = useState(false);

  const playTrack = async () => {
    try {
      await fetch('/api/music/play', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          track: track.Name,
          artist: track.Artists?.[0],
        }),
      });
    } catch (error) {
      console.error('Failed to play track:', error);
    }
  };

  const addToQueue = async () => {
    try {
      await fetch('/api/music/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          track: track.Name,
          artist: track.Artists?.[0],
        }),
      });
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      console.error('Failed to add to queue:', error);
    }
  };

  return (
    <>
      {showToast && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
          Successfully added <strong>{track.Name}</strong> to queue
        </div>
      )}
      <div className="w-full p-3 bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 rounded-lg transition flex justify-between items-center shadow-sm hover:shadow-md border border-blue-200">
        <div className="flex-1 min-w-0">
          <div className="font-medium text-gray-900">{track.Name}</div>
          <div className="text-sm text-gray-600">
            {track.Artists?.[0]} {track.Album && `• ${track.Album}`}
          </div>
        </div>
        <div className="flex gap-2 ml-2">
          <button
            onClick={playTrack}
            className="p-2 bg-green-200 hover:bg-green-300 rounded-lg transition"
            title="Play Now"
          >
            ▶️
          </button>
          <button
            onClick={addToQueue}
            className="p-2 bg-blue-200 hover:bg-blue-300 rounded-lg transition"
            title="Add to Queue"
          >
            ➕
          </button>
        </div>
      </div>
    </>
  );
}
