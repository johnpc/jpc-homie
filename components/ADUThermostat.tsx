'use client';

import { useState, useEffect } from 'react';

interface ThermostatState {
  currentTemp: number;
  targetTemp: number;
  targetLow: number;
  targetHigh: number;
  mode: string;
  humidity: number;
}

export default function ADUThermostat() {
  const [data, setData] = useState<ThermostatState | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [mode, setMode] = useState('heat');
  const [temp, setTemp] = useState(72);
  const [lowTemp, setLowTemp] = useState(68);
  const [highTemp, setHighTemp] = useState(74);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/adu/thermostat');
      const result = await response.json();
      setData(result);
      setMode(result.mode);
      setTemp(Math.round(result.targetTemp || 72));
      setLowTemp(Math.round(result.targetLow || 68));
      setHighTemp(Math.round(result.targetHigh || 74));
    } catch (err) {
      console.error('Failed to fetch thermostat state:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const updateThermostat = async () => {
    setActionLoading(true);
    try {
      await fetch('/api/adu/thermostat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          mode === 'heat_cool'
            ? { mode, targetLow: lowTemp, targetHigh: highTemp }
            : { mode, temperature: temp }
        ),
      });
      setTimeout(fetchData, 2000);
    } catch (err) {
      console.error('Failed to update thermostat:', err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="bg-white rounded-lg shadow-lg p-6">Loading...</div>;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-900">🌡️ Thermostat</h2>
      <div className="space-y-4">
        <div className="text-center">
          <div className="text-4xl font-bold text-blue-600">
            {Math.round(data?.currentTemp || 0)}°F
          </div>
          <div className="text-sm text-gray-600">Current</div>
        </div>

        <div className="bg-gray-50 rounded-lg p-3 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Target:</span>
            <span className="font-semibold text-gray-900">
              {data?.mode === 'off'
                ? 'Off'
                : mode === 'heat_cool'
                  ? `${Math.round(data?.targetLow || 0)}-${Math.round(data?.targetHigh || 0)}°F`
                  : `${Math.round(data?.targetTemp || 0)}°F`}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Humidity:</span>
            <span className="font-semibold text-gray-900">{data?.humidity}%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Mode:</span>
            <span className="font-semibold text-gray-900 capitalize">
              {data?.mode?.replace('_', ' ')}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-gray-900"
          >
            <option value="heat">Heat</option>
            <option value="cool">Cool</option>
            <option value="heat_cool">Auto</option>
            <option value="off">Off</option>
          </select>

          {mode === 'heat_cool' ? (
            <div className="space-y-2">
              <input
                type="number"
                value={lowTemp}
                onChange={(e) => setLowTemp(parseInt(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg text-gray-900"
                placeholder="Low temp"
              />
              <input
                type="number"
                value={highTemp}
                onChange={(e) => setHighTemp(parseInt(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg text-gray-900"
                placeholder="High temp"
              />
            </div>
          ) : (
            <input
              type="number"
              value={temp}
              onChange={(e) => setTemp(parseInt(e.target.value))}
              className="w-full px-3 py-2 border rounded-lg text-gray-900"
              placeholder="Temperature"
            />
          )}

          <button
            onClick={updateThermostat}
            disabled={actionLoading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {actionLoading ? 'Updating...' : 'Update'}
          </button>
        </div>
      </div>
    </div>
  );
}
