'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { CarData } from '@/app/api/car/route';

export default function CarCard() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<CarData>({
    queryKey: ['car'],
    queryFn: async () => {
      const res = await fetch('/api/car');
      return res.json();
    },
    refetchInterval: 60000,
  });

  const action = useMutation({
    mutationFn: async (act: string) => {
      const res = await fetch('/api/car', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: act }),
      });
      return res.json();
    },
    onSuccess: () => {
      setTimeout(() => queryClient.invalidateQueries({ queryKey: ['car'] }), 3000);
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!data) return <div className="text-center text-gray-500">No car data</div>;

  const batteryColor =
    data.battery > 50 ? 'bg-green-500' : data.battery > 20 ? 'bg-yellow-500' : 'bg-red-500';

  const psiColor = (psi: number) =>
    psi >= 40 && psi <= 45
      ? 'text-green-600'
      : psi < 38 || psi > 46
        ? 'text-red-600'
        : 'text-yellow-600';

  return (
    <div className="space-y-4">
      {/* Location */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Location</h3>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${data.isHome ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}
          >
            {data.isHome ? '🏠 Home' : '📍 Away'}
          </span>
        </div>
      </div>

      {/* Battery */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-900">Battery</h3>
        <div className="flex items-center gap-4 mb-2">
          <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
            <div
              className={`h-full ${batteryColor} transition-all`}
              style={{ width: `${data.battery}%` }}
            />
          </div>
          <span className="text-2xl font-bold text-gray-900">{Math.round(data.battery)}%</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>{Math.round(data.range)} mi range</span>
          <span>Limit: {Math.round(data.chargeLimit)}%</span>
        </div>
        {data.charging !== 'disconnected' && data.charging !== 'stopped' && (
          <div className="mt-2 text-sm">
            <span className="text-green-600 font-medium">⚡ {data.charging}</span>
            {data.timeToFull && data.timeToFull !== 'unknown' && (
              <span className="text-gray-600 ml-2">({data.timeToFull} to full)</span>
            )}
          </div>
        )}
      </div>

      {/* Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-900">Status</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Inside</span>
            <span className="font-medium text-gray-900">{Math.round(data.insideTemp)}°F</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Outside</span>
            <span className="font-medium text-gray-900">{Math.round(data.outsideTemp)}°F</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Odometer</span>
            <span className="font-medium text-gray-900">
              {Math.round(data.odometer).toLocaleString()} mi
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Lock</span>
            <span className={`font-medium ${data.locked ? 'text-green-600' : 'text-red-600'}`}>
              {data.locked ? '🔒 Locked' : '🔓 Unlocked'}
            </span>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-sm text-gray-600">Sentry Mode</span>
          <span
            className={`text-sm font-medium ${data.sentryMode ? 'text-green-600' : 'text-gray-400'}`}
          >
            {data.sentryMode ? '👁️ Active' : 'Off'}
          </span>
        </div>
      </div>

      {/* Tire Pressure */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-900">Tire Pressure</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Front Left</span>
            <span className={`font-medium ${psiColor(data.tirePressure.frontLeft)}`}>
              {data.tirePressure.frontLeft.toFixed(1)} psi
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Front Right</span>
            <span className={`font-medium ${psiColor(data.tirePressure.frontRight)}`}>
              {data.tirePressure.frontRight.toFixed(1)} psi
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Rear Left</span>
            <span className={`font-medium ${psiColor(data.tirePressure.rearLeft)}`}>
              {data.tirePressure.rearLeft.toFixed(1)} psi
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Rear Right</span>
            <span className={`font-medium ${psiColor(data.tirePressure.rearRight)}`}>
              {data.tirePressure.rearRight.toFixed(1)} psi
            </span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-900">Controls</h3>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => action.mutate(data.locked ? 'unlock' : 'lock')}
            disabled={action.isPending}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 text-sm"
          >
            {data.locked ? '🔓 Unlock' : '🔒 Lock'}
          </button>
          <button
            onClick={() => action.mutate(data.sentryMode ? 'sentry_off' : 'sentry_on')}
            disabled={action.isPending}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 text-sm"
          >
            👁️ Sentry
          </button>
          <button
            onClick={() => action.mutate('wake')}
            disabled={action.isPending}
            className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400 text-sm"
          >
            ⏰ Wake
          </button>
          <button
            onClick={() => action.mutate('trunk')}
            disabled={action.isPending}
            className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400 text-sm"
          >
            🚗 Trunk
          </button>
          <button
            onClick={() => action.mutate('frunk')}
            disabled={action.isPending}
            className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400 text-sm"
          >
            🚗 Frunk
          </button>
          <button
            onClick={() => action.mutate('flash')}
            disabled={action.isPending}
            className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400 text-sm"
          >
            💡 Flash
          </button>
        </div>
      </div>

      {/* Garage */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-900">Garage</h3>
        <div className="flex items-center justify-between">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${data.garage.state === 'closed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
          >
            {data.garage.state === 'closed' ? '🚪 Closed' : '🚪 Open'}
          </span>
          <button
            onClick={() => action.mutate('garage')}
            disabled={action.isPending}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 text-sm"
          >
            {data.garage.state === 'closed' ? 'Open' : 'Close'}
          </button>
        </div>
      </div>

      {/* Climate */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-900">Climate</h3>
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm text-gray-600">
            <span>Current: {Math.round(data.climate.currentTemp)}°F</span>
            <span className="mx-2">→</span>
            <span>Target: {Math.round(data.climate.targetTemp)}°F</span>
          </div>
          <span
            className={`px-2 py-1 rounded text-xs font-medium ${data.climate.state !== 'off' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}
          >
            {data.climate.state !== 'off' ? '🔥 On' : 'Off'}
          </span>
        </div>
        <button
          onClick={() => action.mutate(data.climate.state !== 'off' ? 'climate_off' : 'climate_on')}
          disabled={action.isPending}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 text-sm"
        >
          {data.climate.state !== 'off' ? 'Turn Off' : 'Start Preconditioning'}
        </button>
      </div>

      {/* Software Update */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-900">Software</h3>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">v{data.update.installed}</span>
          {data.update.available ? (
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              🆕 Update available: v{data.update.latest}
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              ✓ Up to date
            </span>
          )}
        </div>
      </div>

      {/* Charging Cost */}
      {data.chargingCost && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-900">Charging This Month</h3>
          <div className="grid grid-cols-3 gap-3 text-center mb-4">
            <div>
              <div className="text-2xl font-bold text-green-600">
                ${data.chargingCost.cost.toFixed(2)}
              </div>
              <div className="text-xs text-gray-500">Est. Cost</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{data.chargingCost.kWh}</div>
              <div className="text-xs text-gray-500">kWh</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {data.chargingCost.sessions.length}
              </div>
              <div className="text-xs text-gray-500">Sessions</div>
            </div>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 text-xs">
                <th className="text-left pb-1">Date</th>
                <th className="text-right pb-1">kWh</th>
                <th className="text-right pb-1">Range</th>
                <th className="text-right pb-1">Rate</th>
                <th className="text-right pb-1">Cost</th>
              </tr>
            </thead>
            <tbody>
              {data.chargingCost.sessions.map((s, i) => (
                <tr key={i} className="border-t border-gray-100">
                  <td className="py-1 text-gray-700">{s.date}</td>
                  <td className="py-1 text-right text-gray-700">{s.kWh}</td>
                  <td className="py-1 text-right text-gray-700">+{s.miles} mi</td>
                  <td className="py-1 text-right text-gray-500">{Math.round(s.rate * 100)}¢</td>
                  <td className="py-1 text-right text-gray-700">${s.cost.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="text-xs text-gray-400 mt-2 text-center">
            DTE rates: 11¢ super off-peak (1-7am) · 15.5¢ off-peak · 17-21¢ peak
          </div>
        </div>
      )}
    </div>
  );
}
