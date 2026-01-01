'use client';

import { useState, useEffect } from 'react';

export default function Temperature() {
  const [data, setData] = useState<{
    currentTemp: number;
    targetTemp: number;
    targetLow: number;
    targetHigh: number;
    mode: string;
    heating: boolean;
  } | null>(null);
  const [targetValue, setTargetValue] = useState(72);
  const [lowTemp, setLowTemp] = useState(68);
  const [highTemp, setHighTemp] = useState(74);
  const [mode, setMode] = useState('heat');
  const [scale, setScale] = useState<'F' | 'C'>('F');
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    const res = await fetch('/api/temperature');
    const json = await res.json();
    setData(json);
    // Map 'range' mode to 'heat-cool' for the UI
    setMode(json.mode === 'range' ? 'heat-cool' : json.mode);
    if (json.targetTemp) {
      setTargetValue(
        scale === 'F' ? Math.round((json.targetTemp * 9) / 5 + 32) : Math.round(json.targetTemp)
      );
    }
    if (json.targetLow && json.targetHigh) {
      setLowTemp(
        scale === 'F' ? Math.round((json.targetLow * 9) / 5 + 32) : Math.round(json.targetLow)
      );
      setHighTemp(
        scale === 'F' ? Math.round((json.targetHigh * 9) / 5 + 32) : Math.round(json.targetHigh)
      );
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const setTemp = async () => {
    setLoading(true);

    if (mode === 'heat-cool') {
      await fetch('/api/temperature/range', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ low: lowTemp, high: highTemp, mode, scale }),
      });
    } else {
      await fetch('/api/temperature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: targetValue, mode, scale }),
      });
    }

    // Wait 10 seconds then refresh
    setTimeout(async () => {
      await fetchData();
      setLoading(false);
    }, 10000);
  };

  if (!data) return <div className="text-center py-8">Loading...</div>;

  const currentC = Math.round(data.currentTemp);
  const currentF = Math.round((data.currentTemp * 9) / 5 + 32);
  const targetC = Math.round(data.targetTemp);
  const targetF = Math.round((data.targetTemp * 9) / 5 + 32);
  const lowC = Math.round(data.targetLow);
  const lowF = Math.round((data.targetLow * 9) / 5 + 32);
  const highC = Math.round(data.targetHigh);
  const highF = Math.round((data.targetHigh * 9) / 5 + 32);

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-center text-black">🌡️ Thermostat</h2>

      <div className="mb-6 text-center">
        <div className="text-5xl font-bold text-blue-600 mb-2">
          {scale === 'F' ? currentF : currentC}°{scale}
        </div>
        <div className="text-gray-600">Current Temperature</div>
      </div>

      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex justify-between mb-2">
          <span className="text-gray-700">Target:</span>
          <span className="font-semibold text-black">
            {data.mode === 'range'
              ? `${scale === 'F' ? lowF : lowC}-${scale === 'F' ? highF : highC}°${scale}`
              : `${scale === 'F' ? targetF : targetC}°${scale}`}
          </span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-gray-700">Mode:</span>
          <span className="font-semibold capitalize text-black">{data.mode}</span>
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
        {mode === 'heat-cool' || mode === 'range' ? (
          <div className="space-y-2 mb-2">
            <div className="flex gap-2 items-center">
              <span className="text-sm text-gray-600 w-12">Low:</span>
              <input
                type="text"
                inputMode="numeric"
                value={lowTemp}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, '');
                  if (val === '' || (parseInt(val) >= 0 && parseInt(val) <= 100)) {
                    setLowTemp(val === '' ? 0 : parseInt(val));
                  }
                }}
                className="flex-1 px-4 py-2 border rounded-lg text-black"
              />
            </div>
            <div className="flex gap-2 items-center">
              <span className="text-sm text-gray-600 w-12">High:</span>
              <input
                type="text"
                inputMode="numeric"
                value={highTemp}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, '');
                  if (val === '' || (parseInt(val) >= 0 && parseInt(val) <= 100)) {
                    setHighTemp(val === '' ? 0 : parseInt(val));
                  }
                }}
                className="flex-1 px-4 py-2 border rounded-lg text-black"
              />
            </div>
            <select
              value={scale}
              onChange={(e) => {
                const newScale = e.target.value as 'F' | 'C';
                setScale(newScale);
                if (newScale === 'F') {
                  setLowTemp(Math.round((data.targetTemp * 9) / 5 + 32) - 3);
                  setHighTemp(Math.round((data.targetTemp * 9) / 5 + 32) + 3);
                } else {
                  setLowTemp(Math.round(data.targetTemp) - 2);
                  setHighTemp(Math.round(data.targetTemp) + 2);
                }
              }}
              className="w-full px-4 py-2 border rounded-lg text-black"
            >
              <option value="F">°F</option>
              <option value="C">°C</option>
            </select>
          </div>
        ) : (
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              inputMode="numeric"
              value={targetValue}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, '');
                if (val === '' || (parseInt(val) >= 0 && parseInt(val) <= 100)) {
                  setTargetValue(val === '' ? 0 : parseInt(val));
                }
              }}
              className="flex-1 px-4 py-2 border rounded-lg text-black"
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
              className="px-4 py-2 border rounded-lg text-black"
            >
              <option value="F">°F</option>
              <option value="C">°C</option>
            </select>
          </div>
        )}
        <div className="mb-2">
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg text-black"
          >
            <option value="heat">Heat</option>
            <option value="cool">Cool</option>
            <option value="heat-cool">Heat/Cool</option>
            <option value="off">Off</option>
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
