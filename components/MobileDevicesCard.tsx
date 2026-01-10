'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

interface Phone {
  name: string;
  ip: string;
  mac: string;
  type: 'ios' | 'android';
  connected: boolean;
  wireless: boolean;
  signal: string;
}

interface EeroDevice {
  name: string;
  ip: string;
  mac: string;
  type: string;
  connected: boolean;
  wireless: boolean;
  signal: string;
  manufacturer: string;
}

export default function MobileDevicesCard() {
  const [expanded, setExpanded] = useState(false);

  const { data: phones } = useQuery<Phone[]>({
    queryKey: ['phones'],
    queryFn: async () => {
      const res = await fetch('/api/phones');
      return res.json();
    },
    refetchInterval: 60000,
  });

  const { data: allDevices } = useQuery<EeroDevice[]>({
    queryKey: ['eero-devices'],
    queryFn: async () => {
      const res = await fetch('/api/eero-devices');
      return res.json();
    },
    refetchInterval: 60000,
    enabled: expanded,
  });

  const connectedCount = phones?.filter((p) => p.connected).length || 0;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900">Mobile Devices</h3>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-blue-600 hover:text-blue-700 text-sm"
        >
          {expanded ? '▼' : '▶'}
        </button>
      </div>

      {/* Connected phones - always visible */}
      <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mb-3">
        {connectedCount} CONNECTED
      </span>

      {phones && phones.length > 0 && (
        <div className="space-y-2">
          {phones.map((phone, i) => (
            <div
              key={i}
              className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded"
            >
              <div className="flex items-center gap-2">
                <span className={phone.connected ? 'text-green-600' : 'text-gray-400'}>
                  {phone.connected ? '●' : '○'}
                </span>
                <span className="text-gray-700">{phone.name}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                {phone.wireless && <span>📶</span>}
                {phone.type === 'ios' ? '🍎' : '🤖'}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* All devices - shown when expanded */}
      {expanded && allDevices && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">All Devices</h4>
          <div className="space-y-1 max-h-96 overflow-y-auto">
            {allDevices.map((device, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-xs p-2 bg-gray-50 rounded"
              >
                <div className="flex items-center gap-2">
                  <span className={device.connected ? 'text-green-600' : 'text-gray-400'}>
                    {device.connected ? '●' : '○'}
                  </span>
                  <span className="text-gray-700 truncate max-w-[150px]">{device.name}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  {device.wireless ? '📶' : '🔌'}
                  <span className="text-gray-400">{device.type}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
