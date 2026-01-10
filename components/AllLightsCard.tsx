'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import LightControls from './LightControls';

interface AllLightsCardProps {
  lightsOn: number;
  brightness: number;
  lights?: Array<{ id: string; name: string; on: boolean }>;
}

export default function AllLightsCard({
  lightsOn,
  brightness: initialBrightness,
  lights,
}: AllLightsCardProps) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [brightness, setBrightness] = useState(initialBrightness);

  if (brightness === 0 && initialBrightness > 0) {
    setBrightness(initialBrightness);
  }

  const controlLights = useMutation({
    mutationFn: async (action: string | { action: string; brightness: number }) => {
      setLoading(true);
      const res = await fetch('/api/lights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(typeof action === 'string' ? { action } : action),
      });
      return res.json();
    },
    onSuccess: () => {
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        queryClient.invalidateQueries({ queryKey: ['rooms'] });
        setLoading(false);
      }, 2000);
    },
  });

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-3 text-gray-900">All Lights</h3>
      <span
        className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-3 ${
          lightsOn === 0 ? 'bg-gray-200 text-gray-700' : 'bg-blue-100 text-blue-800'
        }`}
      >
        {lightsOn} ON
      </span>

      <LightControls
        brightness={brightness}
        onBrightnessChange={setBrightness}
        onBrightnessSet={() => controlLights.mutate({ action: 'set_brightness', brightness })}
        onAction={(action) => controlLights.mutate(action)}
        isLoading={loading}
        lights={lights}
      />
    </div>
  );
}
