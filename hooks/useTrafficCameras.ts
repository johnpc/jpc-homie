import { useQuery } from '@tanstack/react-query';

export interface TrafficCamera {
  id: number;
  route: string;
  location: string;
  direction: string;
  latitude: number;
  longitude: number;
  imageUrl: string;
  thumbnailUrl: string;
  distanceMiles: number;
}

export interface TrafficCamerasResponse {
  radiusMiles: number;
  totalCount: number;
  byRoute: Record<string, { count: number; cameras: TrafficCamera[] }>;
  allCameras: TrafficCamera[];
}

async function fetchTrafficCameras(): Promise<TrafficCamerasResponse> {
  const res = await fetch('/api/traffic-cameras');
  if (!res.ok) {
    throw new Error('Failed to fetch traffic cameras');
  }
  return res.json();
}

export function useTrafficCameras() {
  return useQuery<TrafficCamerasResponse>({
    queryKey: ['traffic-cameras'],
    queryFn: fetchTrafficCameras,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}
