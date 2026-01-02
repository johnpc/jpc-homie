'use client';

import { useState, useEffect } from 'react';

interface TVState {
  state: string;
  isMuted: boolean;
  appName?: string;
  appId?: string;
  mediaTitle?: string;
  source?: string;
  volumeLevel?: number;
}

export default function ADUTVStatus() {
  const [tvState, setTvState] = useState<TVState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTVState = async () => {
      try {
        const response = await fetch('/api/adu/tv');
        const data = await response.json();
        setTvState(data);
      } catch (err) {
        console.error('Failed to fetch TV state:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTVState();
    const interval = setInterval(fetchTVState, 10000);
    return () => clearInterval(interval);
  }, []);

  const togglePower = async () => {
    try {
      await fetch('/api/adu/tv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle' }),
      });
      setTimeout(
        () =>
          fetch('/api/adu/tv')
            .then((r) => r.json())
            .then(setTvState),
        2000
      );
    } catch (err) {
      console.error('Failed to toggle TV:', err);
    }
  };

  if (loading) return <div className="bg-white rounded-lg shadow-lg p-6">Loading...</div>;

  const isOn = tvState?.state !== 'off' && tvState?.state !== 'unavailable';

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-900">📺 TV</h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="text-2xl font-bold text-gray-900 capitalize">
              {isOn ? '✅ On' : '⭕ Off'}
            </div>
            <div className="text-sm text-gray-600 mt-1">Status: {tvState?.state}</div>
            {tvState?.appName && (
              <div className="text-sm text-gray-900 font-semibold mt-1">App: {tvState.appName}</div>
            )}
            {tvState?.source && (
              <div className="text-sm text-gray-600 mt-1">Source: {tvState.source}</div>
            )}
            {tvState?.mediaTitle && (
              <div className="text-sm text-gray-600 mt-1">Playing: {tvState.mediaTitle}</div>
            )}
          </div>
        </div>
        {isOn && (
          <button
            onClick={togglePower}
            className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
          >
            Turn Off
          </button>
        )}
      </div>
    </div>
  );
}
