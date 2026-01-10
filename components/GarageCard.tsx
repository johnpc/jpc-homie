'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface GarageCardProps {
  state: string;
  time: string;
}

export default function GarageCard({ state, time }: GarageCardProps) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const toggleGarage = useMutation({
    mutationFn: async (action: 'open' | 'close') => {
      setLoading(true);
      const res = await fetch('/api/garage', {
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
      }, 15000);
    },
  });

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-3 text-gray-900">Garage Door</h3>
      <div className="flex items-center justify-between mb-2">
        <span
          className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
            state === 'closed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {state.toUpperCase()}
        </span>
        <button
          onClick={() => toggleGarage.mutate(state === 'closed' ? 'open' : 'close')}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 text-sm flex items-center gap-2"
        >
          {loading ? (
            <>
              <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
              {state === 'closed' ? 'Opening' : 'Closing'}
            </>
          ) : state === 'closed' ? (
            'Open'
          ) : (
            'Close'
          )}
        </button>
      </div>
      <p className="text-sm text-gray-500">{time}</p>
    </div>
  );
}
