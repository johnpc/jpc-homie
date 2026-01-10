'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

interface StairsCardProps {
  on: number;
  total: number;
}

export default function StairsCard({ on, total }: StairsCardProps) {
  const queryClient = useQueryClient();

  const toggleStairs = useMutation({
    mutationFn: async (action: 'on' | 'off') => {
      const res = await fetch('/api/stairs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      return res.json();
    },
    onSuccess: () => {
      setTimeout(() => queryClient.invalidateQueries({ queryKey: ['dashboard'] }), 1000);
    },
  });

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-3 text-gray-900">Heated Stairs</h3>
      <div className="flex items-center justify-between">
        <span
          className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
            on === 0 ? 'bg-gray-200 text-gray-700' : 'bg-red-100 text-red-800'
          }`}
        >
          {on === 0 ? 'OFF' : `${on}/${total} ON`}
        </span>
        <button
          onClick={() => toggleStairs.mutate(on === 0 ? 'on' : 'off')}
          disabled={toggleStairs.isPending}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 text-sm"
        >
          {toggleStairs.isPending ? '...' : on === 0 ? 'Turn On' : 'Turn Off'}
        </button>
      </div>
    </div>
  );
}
