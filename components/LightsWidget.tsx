'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import LightControls from './LightControls';

interface Room {
  id: string;
  name: string;
  lightsOn: number;
  avgBrightness: number;
  lightDetails?: Array<{ id: string; name: string; on: boolean }>;
}

interface LightsWidgetProps {
  rooms: Room[];
  allLightsOn: number;
  allBrightness: number;
  allLights?: Array<{ id: string; name: string; on: boolean }>;
}

export default function LightsWidget({
  rooms,
  allLightsOn,
  allBrightness,
  allLights,
}: LightsWidgetProps) {
  const queryClient = useQueryClient();
  const [selectedRoom, setSelectedRoom] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [brightness, setBrightness] = useState(allBrightness);

  const isAllRooms = selectedRoom === 'all';
  const currentRoom = rooms.find((r) => r.id === selectedRoom);

  const displayData = isAllRooms
    ? { lightsOn: allLightsOn, brightness: allBrightness, lights: allLights }
    : {
        lightsOn: currentRoom?.lightsOn ?? 0,
        brightness: currentRoom?.avgBrightness ?? 0,
        lights: currentRoom?.lightDetails,
      };

  const controlLights = useMutation({
    mutationFn: async ({ action, brightness }: { action: string; brightness?: number }) => {
      setLoading(true);
      const endpoint = isAllRooms ? '/api/lights' : '/api/rooms';
      const body = isAllRooms
        ? action === 'set_brightness'
          ? { action, brightness }
          : { action }
        : action === 'set_brightness'
          ? { groupId: selectedRoom, action, brightness }
          : { groupId: selectedRoom, action };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
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

  // Sync brightness when room changes
  const handleRoomChange = (roomId: string) => {
    setSelectedRoom(roomId);
    if (roomId === 'all') {
      setBrightness(allBrightness);
    } else {
      const room = rooms.find((r) => r.id === roomId);
      setBrightness(room?.avgBrightness ?? 0);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-gray-900">
          {isAllRooms ? 'All' : currentRoom?.name} Lights
        </h3>
        <select
          value={selectedRoom}
          onChange={(e) => handleRoomChange(e.target.value)}
          className="text-sm border rounded px-2 py-1 text-gray-700"
        >
          <option value="all">All Rooms</option>
          {rooms.map((room) => (
            <option key={room.id} value={room.id}>
              {room.name}
            </option>
          ))}
        </select>
      </div>

      <span
        className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-3 ${
          displayData.lightsOn === 0 ? 'bg-gray-200 text-gray-700' : 'bg-blue-100 text-blue-800'
        }`}
      >
        {displayData.lightsOn} ON
      </span>

      <LightControls
        brightness={brightness}
        onBrightnessChange={setBrightness}
        onBrightnessSet={() => controlLights.mutate({ action: 'set_brightness', brightness })}
        onAction={(action) => controlLights.mutate({ action })}
        isLoading={loading}
        lights={displayData.lights}
      />
    </div>
  );
}
