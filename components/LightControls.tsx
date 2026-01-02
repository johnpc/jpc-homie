'use client';

import { useState } from 'react';

interface LightControlsProps {
  brightness: number;
  onBrightnessChange: (value: number) => void;
  onBrightnessSet: () => void;
  onAction: (action: string) => void;
  isLoading: boolean;
  lights?: Array<{ id: string; name: string; on: boolean }>;
}

export default function LightControls({
  brightness,
  onBrightnessChange,
  onBrightnessSet,
  onAction,
  isLoading,
  lights,
}: LightControlsProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      {lights && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-sm text-blue-600 hover:text-blue-800 mb-3 flex items-center gap-1"
        >
          {expanded ? '▼' : '▶'} {lights.length} lights
        </button>
      )}

      {expanded && lights && (
        <div className="mb-3 text-xs space-y-1 max-h-32 overflow-y-auto bg-gray-50 p-2 rounded">
          {lights.map((light) => (
            <div key={light.id} className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${light.on ? 'bg-green-500' : 'bg-gray-300'}`}
              />
              <span className={light.on ? 'text-gray-900' : 'text-gray-500'}>{light.name}</span>
            </div>
          ))}
        </div>
      )}

      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-medium text-gray-700">Brightness</label>
          <span className="text-sm text-gray-600">{brightness}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={brightness}
          onChange={(e) => onBrightnessChange(Number(e.target.value))}
          onMouseUp={onBrightnessSet}
          onTouchEnd={onBrightnessSet}
          disabled={isLoading}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => onAction('all_on')}
          disabled={isLoading}
          className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 text-xs"
        >
          All On
        </button>
        <button
          onClick={() => onAction('all_off')}
          disabled={isLoading}
          className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400 text-xs"
        >
          All Off
        </button>
        <button
          onClick={() => onAction('all_bright')}
          disabled={isLoading}
          className="px-3 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:bg-gray-400 text-xs"
        >
          All Bright
        </button>
        <button
          onClick={() => onAction('all_blue')}
          disabled={isLoading}
          className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 text-xs"
        >
          All Blue
        </button>
        <button
          onClick={() => onAction('all_red')}
          disabled={isLoading}
          className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 text-xs"
        >
          All Red
        </button>
        <button
          onClick={() => onAction('all_random')}
          disabled={isLoading}
          className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 text-xs"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></span>
              Loading...
            </span>
          ) : (
            'Random'
          )}
        </button>
      </div>
    </>
  );
}
