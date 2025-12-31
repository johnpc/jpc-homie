'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface DashboardData {
  stairs: { on: number; total: number };
  locks: { locked: number; total: number };
  garage: { state: string; time: string };
  power: { kw: number; kwh: number; cost: number };
  lights: number;
}

export default function Dashboard() {
  const queryClient = useQueryClient();
  const [locksLoading, setLocksLoading] = useState(false);
  const [garageLoading, setGarageLoading] = useState(false);
  const [lightsLoading, setLightsLoading] = useState(false);

  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard');
      return res.json();
    },
    refetchInterval: 60000,
  });

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

  const toggleLocks = useMutation({
    mutationFn: async (action: 'lock' | 'unlock') => {
      setLocksLoading(true);
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
        setLocksLoading(false);
      }, 5000);
    },
  });

  const toggleGarage = useMutation({
    mutationFn: async (action: 'open' | 'close') => {
      setGarageLoading(true);
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
        setGarageLoading(false);
      }, 15000);
    },
  });

  const controlLights = useMutation({
    mutationFn: async (action: string) => {
      setLightsLoading(true);
      const res = await fetch('/api/lights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      return res.json();
    },
    onSuccess: () => {
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        setLightsLoading(false);
      }, 2000);
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!data) return <div className="text-center text-gray-500">No data</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Stairs */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-900">Heated Stairs</h3>
        <div className="flex items-center justify-between">
          <span
            className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
              data.stairs.on === 0 ? 'bg-gray-200 text-gray-700' : 'bg-red-100 text-red-800'
            }`}
          >
            {data.stairs.on === 0 ? 'OFF' : `${data.stairs.on}/${data.stairs.total} ON`}
          </span>
          <button
            onClick={() => toggleStairs.mutate(data.stairs.on === 0 ? 'on' : 'off')}
            disabled={toggleStairs.isPending}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 text-sm"
          >
            {toggleStairs.isPending ? '...' : data.stairs.on === 0 ? 'Turn On' : 'Turn Off'}
          </button>
        </div>
      </div>

      {/* Locks */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-900">Smart Locks</h3>
        <div className="flex items-center justify-between">
          <span
            className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
              data.locks.locked === data.locks.total
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {data.locks.locked === data.locks.total
              ? 'LOCKED'
              : `${data.locks.locked}/${data.locks.total} LOCKED`}
          </span>
          <button
            onClick={() =>
              toggleLocks.mutate(data.locks.locked === data.locks.total ? 'unlock' : 'lock')
            }
            disabled={locksLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 text-sm flex items-center gap-2"
          >
            {locksLoading ? (
              <>
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                {data.locks.locked === data.locks.total ? 'Unlocking' : 'Locking'}
              </>
            ) : data.locks.locked === data.locks.total ? (
              'Unlock'
            ) : (
              'Lock'
            )}
          </button>
        </div>
      </div>

      {/* Garage */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-900">Garage Door</h3>
        <div className="flex items-center justify-between mb-2">
          <span
            className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
              data.garage.state === 'closed'
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {data.garage.state.toUpperCase()}
          </span>
          <button
            onClick={() => toggleGarage.mutate(data.garage.state === 'closed' ? 'open' : 'close')}
            disabled={garageLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 text-sm flex items-center gap-2"
          >
            {garageLoading ? (
              <>
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                {data.garage.state === 'closed' ? 'Opening' : 'Closing'}
              </>
            ) : data.garage.state === 'closed' ? (
              'Open'
            ) : (
              'Close'
            )}
          </button>
        </div>
        <p className="text-sm text-gray-500">{data.garage.time}</p>
      </div>

      {/* Power */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-900">Energy Usage</h3>
        <div className="space-y-1">
          <p className="text-2xl font-bold text-gray-900">{data.power.kw.toFixed(2)} kW</p>
          <p className="text-sm text-gray-700">{data.power.kwh.toFixed(2)} kWh</p>
          <p className="text-sm text-gray-500">${data.power.cost.toFixed(2)}</p>
        </div>
      </div>

      {/* Lights */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-900">Lights</h3>
        <span
          className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-3 ${
            data.lights === 0 ? 'bg-gray-200 text-gray-700' : 'bg-blue-100 text-blue-800'
          }`}
        >
          {data.lights} ON
        </span>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => controlLights.mutate('all_on')}
            disabled={lightsLoading}
            className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 text-xs"
          >
            All On
          </button>
          <button
            onClick={() => controlLights.mutate('all_off')}
            disabled={lightsLoading}
            className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400 text-xs"
          >
            All Off
          </button>
          <button
            onClick={() => controlLights.mutate('all_bright')}
            disabled={lightsLoading}
            className="px-3 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:bg-gray-400 text-xs"
          >
            All Bright
          </button>
          <button
            onClick={() => controlLights.mutate('all_blue')}
            disabled={lightsLoading}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 text-xs"
          >
            All Blue
          </button>
          <button
            onClick={() => controlLights.mutate('all_red')}
            disabled={lightsLoading}
            className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 text-xs"
          >
            All Red
          </button>
          <button
            onClick={() => controlLights.mutate('all_random')}
            disabled={lightsLoading}
            className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 text-xs"
          >
            {lightsLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></span>
                Loading...
              </span>
            ) : (
              'Random'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
