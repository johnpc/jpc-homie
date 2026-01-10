'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import LightControls from './LightControls';

interface RoomCardProps {
  id: string;
  name: string;
  lightsOn: number;
  avgBrightness: number;
  lightDetails?: Array<{ id: string; name: string; on: boolean }>;
}

export default function RoomCard({
  id,
  name,
  lightsOn,
  avgBrightness,
  lightDetails,
}: RoomCardProps) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [brightness, setBrightness] = useState(avgBrightness);

  const controlRoomLights = useMutation({
    mutationFn: async ({ action, brightness }: { action: string; brightness?: number }) => {
      setLoading(true);
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          action === 'set_brightness'
            ? { groupId: id, action, brightness }
            : { groupId: id, action }
        ),
      });
      return res.json();
    },
    onSuccess: () => {
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['rooms'] });
        setLoading(false);
      }, 2000);
    },
  });

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-3 text-gray-900">{name}</h3>
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
        onBrightnessSet={() =>
          controlRoomLights.mutate({
            action: 'set_brightness',
            brightness,
          })
        }
        onAction={(action) => controlRoomLights.mutate({ action })}
        isLoading={loading}
        lights={lightDetails}
      />
    </div>
  );
}
