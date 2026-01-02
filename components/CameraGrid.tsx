'use client';

import { useState, useEffect } from 'react';

interface Camera {
  id: string;
  name: string;
  imageUrl: string;
}

interface FrigateEvent {
  id: string;
  camera: string;
  label: string;
  startTime: string;
  thumbnailUrl: string;
  clipUrl: string | null;
}

export default function CameraGrid() {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [events, setEvents] = useState<FrigateEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [camerasRes, eventsRes] = await Promise.all([
          fetch('/api/cameras'),
          fetch('/api/frigate'),
        ]);
        const camerasData = await camerasRes.json();
        const eventsData = await eventsRes.json();
        setCameras(camerasData);
        setEvents(eventsData);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">📹 Cameras</h2>
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">📹 Live Cameras</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cameras.map((camera) => (
            <div key={camera.id} className="bg-gray-100 rounded-lg overflow-hidden">
              <div className="p-3 bg-gray-800 text-white font-semibold">{camera.name}</div>
              <img
                src={camera.imageUrl}
                alt={camera.name}
                className="w-full h-auto"
                key={Date.now()}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">🚨 Recent Events</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {events.map((event) => (
            <div key={event.id} className="bg-gray-100 rounded-lg overflow-hidden">
              <img src={event.thumbnailUrl} alt={event.label} className="w-full h-auto" />
              <div className="p-2">
                <div className="text-xs font-semibold text-gray-900 capitalize">
                  {event.label} - {event.camera.replace('_', ' ')}
                </div>
                <div className="text-xs text-gray-600">{event.startTime}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
