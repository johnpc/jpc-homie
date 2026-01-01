'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface MediaPlayerState {
  state: string;
  attributes: {
    media_title?: string;
    media_artist?: string;
    app_name?: string;
    volume_level?: number;
  };
}

export default function RemoteControl() {
  const queryClient = useQueryClient();
  const [textInput, setTextInput] = useState('');

  const { data: tvState } = useQuery<MediaPlayerState>({
    queryKey: ['tv-state'],
    queryFn: async () => {
      const res = await fetch('/api/tv/status');
      return res.json();
    },
    refetchInterval: 5000,
  });

  const sendCommand = useMutation({
    mutationFn: async (command: string) => {
      const res = await fetch('/api/tv/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command }),
      });
      return res.json();
    },
    onSuccess: () => {
      setTimeout(() => queryClient.invalidateQueries({ queryKey: ['tv-state'] }), 500);
    },
  });

  const sendText = useMutation({
    mutationFn: async (text: string) => {
      const res = await fetch('/api/tv/text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      return res.json();
    },
  });

  const setVolume = useMutation({
    mutationFn: async (params: { direction: string }) => {
      const res = await fetch('/api/tv/volume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      return res.json();
    },
  });

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim()) {
      sendText.mutate(textInput);
      setTextInput('');
    }
  };

  const isOn =
    tvState?.state === 'on' || tvState?.state === 'playing' || tvState?.state === 'paused';

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Status Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-black">📺 Nvidia Shield</h3>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              isOn ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}
          >
            {tvState?.state || 'unknown'}
          </span>
        </div>

        {isOn && (
          <div className="space-y-2 text-gray-700">
            {tvState?.attributes.app_name && (
              <p>
                <span className="font-medium">App:</span> {tvState.attributes.app_name}
              </p>
            )}
            {tvState?.attributes.media_title && (
              <p>
                <span className="font-medium">Playing:</span> {tvState.attributes.media_title}
              </p>
            )}
            {tvState?.attributes.media_artist && (
              <p>
                <span className="font-medium">Artist:</span> {tvState.attributes.media_artist}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Power & Volume */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Power Control</label>
          <div className="flex gap-3">
            <button
              onClick={() => sendCommand.mutate('turn_on')}
              className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700"
            >
              Power On
            </button>
            <button
              onClick={() => sendCommand.mutate('turn_off')}
              className="flex-1 bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700"
            >
              Power Off
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Volume Control</label>
          <div className="flex gap-2">
            <button
              onClick={() => setVolume.mutate({ direction: 'down' })}
              className="flex-1 bg-gray-200 hover:bg-gray-300 py-3 rounded-lg font-medium text-xl"
            >
              🔉➖
            </button>
            <button
              onClick={() => setVolume.mutate({ direction: 'mute' })}
              className="flex-1 bg-gray-200 hover:bg-gray-300 py-3 rounded-lg font-medium text-xl"
            >
              🔇❌
            </button>
            <button
              onClick={() => setVolume.mutate({ direction: 'up' })}
              className="flex-1 bg-gray-200 hover:bg-gray-300 py-3 rounded-lg font-medium text-xl"
            >
              🔉➕
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Pad */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 text-black">Navigation</h3>
        <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
          <div></div>
          <button
            onClick={async () => {
              await fetch('/api/tv/remote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ button: 'Up' }),
              });
            }}
            className="bg-gray-200 hover:bg-gray-300 p-4 rounded-lg font-bold"
          >
            ⬆️
          </button>
          <div></div>

          <button
            onClick={async () => {
              await fetch('/api/tv/remote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ button: 'Left' }),
              });
            }}
            className="bg-gray-200 hover:bg-gray-300 p-4 rounded-lg font-bold"
          >
            ⬅️
          </button>
          <button
            onClick={async () => {
              await fetch('/api/tv/remote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ button: 'Select' }),
              });
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg font-bold"
          >
            OK
          </button>
          <button
            onClick={async () => {
              await fetch('/api/tv/remote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ button: 'Right' }),
              });
            }}
            className="bg-gray-200 hover:bg-gray-300 p-4 rounded-lg font-bold"
          >
            ➡️
          </button>

          <div></div>
          <button
            onClick={async () => {
              await fetch('/api/tv/remote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ button: 'Down' }),
              });
            }}
            className="bg-gray-200 hover:bg-gray-300 p-4 rounded-lg font-bold"
          >
            ⬇️
          </button>
          <div></div>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-4">
          <button
            onClick={async () => {
              await fetch('/api/tv/remote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ button: 'Back' }),
              });
            }}
            className="bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-medium"
          >
            ◀️ Back
          </button>
          <button
            onClick={async () => {
              await fetch('/api/tv/remote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ button: 'Home' }),
              });
            }}
            className="bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-medium"
          >
            🏠 Home
          </button>
        </div>
      </div>

      {/* Text Input */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 text-black">Text Input</h3>
        <form onSubmit={handleTextSubmit} className="flex gap-2">
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Type text to send to TV..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
          >
            Send
          </button>
        </form>
        <p className="text-sm text-gray-500 mt-2">
          Use this to type passwords or search terms without using the on-screen keyboard
        </p>
      </div>
    </div>
  );
}
