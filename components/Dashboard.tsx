'use client';

import { useQuery } from '@tanstack/react-query';

interface DashboardData {
  stairs: { on: number; total: number };
  locks: { locked: number; total: number };
  garage: { state: string; time: string };
  power: { kw: number; kwh: number; cost: number };
  lights: number;
}

export default function Dashboard() {
  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard');
      return res.json();
    },
    refetchInterval: 60000,
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
        <span
          className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
            data.stairs.on === 0 ? 'bg-gray-200 text-gray-700' : 'bg-red-100 text-red-800'
          }`}
        >
          {data.stairs.on === 0 ? 'OFF' : `${data.stairs.on}/${data.stairs.total} ON`}
        </span>
      </div>

      {/* Locks */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-900">Smart Locks</h3>
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
      </div>

      {/* Garage */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-900">Garage Door</h3>
        <span
          className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
            data.garage.state === 'closed'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {data.garage.state.toUpperCase()}
        </span>
        <p className="text-sm text-gray-500 mt-2">{data.garage.time}</p>
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
          className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
            data.lights === 0 ? 'bg-gray-200 text-gray-700' : 'bg-blue-100 text-blue-800'
          }`}
        >
          {data.lights} ON
        </span>
      </div>
    </div>
  );
}
