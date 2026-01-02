'use client';

import { useState, useEffect } from 'react';

interface LockState {
  state: 'locked' | 'unlocked';
  last_changed: string;
}

export default function ADUSmartLock() {
  const [lockState, setLockState] = useState<LockState | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchLockState = async () => {
    try {
      const response = await fetch('/api/adu/lock');
      const data = await response.json();
      setLockState(data);
    } catch (err) {
      console.error('Failed to fetch lock state:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLockState();
    const interval = setInterval(fetchLockState, 5000);
    return () => clearInterval(interval);
  }, []);

  const toggleLock = async (action: 'lock' | 'unlock') => {
    setActionLoading(true);
    try {
      await fetch('/api/adu/lock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      await fetchLockState();
    } catch (err) {
      console.error('Failed to toggle lock:', err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="bg-white rounded-lg shadow-lg p-6">Loading...</div>;

  const isLocked = lockState?.state === 'locked';
  const lastChanged = lockState?.last_changed
    ? new Date(lockState.last_changed).toLocaleString()
    : 'Unknown';

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-900">🔐 Smart Lock</h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-3xl font-bold text-gray-900">
              {isLocked ? '🔒 Locked' : '🔓 Unlocked'}
            </div>
            <div className="text-sm text-gray-600 mt-1">Since: {lastChanged}</div>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => toggleLock('lock')}
            disabled={actionLoading || isLocked}
            className={`flex-1 py-3 rounded-lg font-medium transition ${
              isLocked
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-red-500 text-white hover:bg-red-600'
            }`}
          >
            {actionLoading ? 'Loading...' : 'Lock'}
          </button>
          <button
            onClick={() => toggleLock('unlock')}
            disabled={actionLoading || !isLocked}
            className={`flex-1 py-3 rounded-lg font-medium transition ${
              !isLocked
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}
          >
            {actionLoading ? 'Loading...' : 'Unlock'}
          </button>
        </div>
      </div>
    </div>
  );
}
