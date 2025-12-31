'use client';

import { useState, useEffect } from 'react';

export default function Temperature() {
  const [data, setData] = useState<{
    currentTemp: number;
    targetTemp: number;
    mode: string;
    heating: boolean;
  } | null>(null);
  const [targetValue, setTargetValue] = useState(72);
  const [scale, setScale] = useState<'F' | 'C'>('F');
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    const res = await fetch('/api/temperature');
    const json = await res.json();
    setData(json);
    if (json.targetTemp) {
      setTargetValue(
        scale === 'F' ? Math.round((json.targetTemp * 9) / 5 + 32) : Math.round(json.targetTemp)
      );
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const setTemp = async () => {
    setLoading(true);
    const expectedTarget = targetValue;

    await fetch('/api/temperature', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value: targetValue, mode: data?.mode || 'heat', scale }),
    });

    // Poll for update with 30s timeout
    const startTime = Date.now();
    const pollInterval = setInterval(async () => {
      const res = await fetch('/api/temperature');
      const json = await res.json();
      const currentTarget =
        scale === 'F' ? Math.round((json.targetTemp * 9) / 5 + 32) : Math.round(json.targetTemp);

      if (currentTarget === expectedTarget) {
        setData(json);
        setLoading(false);
        clearInterval(pollInterval);
      } else if (Date.now() - startTime > 30000) {
        alert('Timeout: Temperature update failed');
        setLoading(false);
        clearInterval(pollInterval);
      }
    }, 1000);
  };

  if (!data) return <div className="text-center py-8">Loading...</div>;

  const currentC = Math.round(data.currentTemp);
  const currentF = Math.round((data.currentTemp * 9) / 5 + 32);
  const targetC = Math.round(data.targetTemp);
  const targetF = Math.round((data.targetTemp * 9) / 5 + 32);

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">🌡️ Thermostat</h2>

      <div className="mb-6 text-center">
        <div className="text-5xl font-bold text-blue-600 mb-2">
          {scale === 'F' ? currentF : currentC}°{scale}
        </div>
        <div className="text-gray-600">Current Temperature</div>
      </div>

      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex justify-between mb-2">
          <span className="text-gray-700">Target:</span>
          <span className="font-semibold">
            {scale === 'F' ? targetF : targetC}°{scale}
          </span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-gray-700">Mode:</span>
          <span className="font-semibold capitalize">{data.mode}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-700">Status:</span>
          <span className={`font-semibold ${data.heating ? 'text-orange-600' : 'text-gray-600'}`}>
            {data.heating ? '🔥 Heating' : '⏸️ Idle'}
          </span>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Set Temperature</label>
        <div className="flex gap-2 mb-2">
          <input
            type="number"
            value={targetValue}
            onChange={(e) => setTargetValue(Number(e.target.value))}
            className="flex-1 px-4 py-2 border rounded-lg"
          />
          <select
            value={scale}
            onChange={(e) => {
              const newScale = e.target.value as 'F' | 'C';
              setScale(newScale);
              setTargetValue(
                newScale === 'F'
                  ? Math.round((data.targetTemp * 9) / 5 + 32)
                  : Math.round(data.targetTemp)
              );
            }}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="F">°F</option>
            <option value="C">°C</option>
          </select>
        </div>
        <button
          onClick={setTemp}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="animate-spin">⏳</span>
              Updating...
            </>
          ) : (
            'Set Temperature'
          )}
        </button>
      </div>
    </div>
  );
}
