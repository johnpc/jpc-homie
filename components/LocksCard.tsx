'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface LocksCardProps {
  locked: number;
  total: number;
}

export default function LocksCard({ locked, total }: LocksCardProps) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const toggleLocks = useMutation({
    mutationFn: async (action: 'lock' | 'unlock') => {
      setLoading(true);
      const res = await fetch('/api/locks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      return res.json();
    },
    onSuccess: () => {
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        setLoading(false);
      }, 5000);
    },
  });

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-3 text-gray-900">Smart Locks</h3>
      <div className="flex items-center justify-between">
        <span
          className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
            locked === total ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {locked === total ? 'LOCKED' : `${locked}/${total} LOCKED`}
        </span>
        <button
          onClick={() => toggleLocks.mutate(locked === total ? 'unlock' : 'lock')}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 text-sm flex items-center gap-2"
        >
          {loading ? (
            <>
              <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
              {locked === total ? 'Unlocking' : 'Locking'}
            </>
          ) : locked === total ? (
            'Unlock'
          ) : (
            'Lock'
          )}
        </button>
      </div>
    </div>
  );
}
