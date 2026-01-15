'use client';

import { useState } from 'react';
import { useTrafficCameras, TrafficCamera } from '@/hooks/useTrafficCameras';

const ROUTE_ORDER = ['I-94', 'M-14', 'US-23'];

function CameraCard({ camera }: { camera: TrafficCamera }) {
  const [imageKey, setImageKey] = useState(Date.now());

  return (
    <div className="bg-gray-100 rounded-lg overflow-hidden">
      <div className="p-3 bg-gray-800 text-white">
        <div className="flex justify-between items-start">
          <div className="font-semibold">
            {camera.route} @ {camera.location}
          </div>
          <span className="text-xs bg-gray-700 px-2 py-0.5 rounded ml-2 whitespace-nowrap">
            {camera.distanceMiles} mi
          </span>
        </div>
        {camera.direction && <div className="text-xs text-gray-300 mt-1">{camera.direction}</div>}
      </div>
      <img
        src={`${camera.thumbnailUrl}&t=${imageKey}`}
        alt={`${camera.route} at ${camera.location}`}
        className="w-full h-auto cursor-pointer"
        onClick={() => setImageKey(Date.now())}
        title="Click to refresh"
      />
    </div>
  );
}

function RouteSection({ route, cameras }: { route: string; cameras: TrafficCamera[] }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="mb-6">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 mb-3 text-lg font-semibold text-gray-700 hover:text-gray-900"
      >
        <span className="text-sm">{expanded ? '▼' : '▶'}</span>
        {route}
        <span className="text-sm font-normal text-gray-500">({cameras.length} cameras)</span>
      </button>
      {expanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cameras.map((camera) => (
            <CameraCard key={camera.id} camera={camera} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function TrafficCamerasGrid() {
  const { data, isLoading, error } = useTrafficCameras();

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Traffic Cameras</h2>
        <div className="text-gray-600">Loading traffic cameras...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Traffic Cameras</h2>
        <div className="text-red-600">Failed to load traffic cameras</div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-900">
        Traffic Cameras
        <span className="text-sm font-normal text-gray-500 ml-2">
          ({data.totalCount} cameras within {data.radiusMiles} mi)
        </span>
      </h2>
      {ROUTE_ORDER.map((route) => {
        const routeData = data.byRoute[route];
        if (!routeData || routeData.cameras.length === 0) return null;
        return <RouteSection key={route} route={route} cameras={routeData.cameras} />;
      })}
    </div>
  );
}
