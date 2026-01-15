import { useQuery } from '@tanstack/react-query';

export interface FrigateCamera {
  id: string;
  name: string;
  imageUrl: string;
}

export interface FrigateEvent {
  id: string;
  camera: string;
  label: string;
  startTime: string;
  thumbnailUrl: string;
  clipUrl: string | null;
}

async function fetchCameras(): Promise<FrigateCamera[]> {
  const res = await fetch('/api/cameras');
  if (!res.ok) {
    throw new Error('Failed to fetch cameras');
  }
  return res.json();
}

async function fetchEvents(): Promise<FrigateEvent[]> {
  const res = await fetch('/api/frigate');
  if (!res.ok) {
    throw new Error('Failed to fetch events');
  }
  return res.json();
}

export function useFrigateCameras() {
  return useQuery<FrigateCamera[]>({
    queryKey: ['frigate-cameras'],
    queryFn: fetchCameras,
    refetchInterval: 5000,
  });
}

export function useFrigateEvents() {
  return useQuery<FrigateEvent[]>({
    queryKey: ['frigate-events'],
    queryFn: fetchEvents,
    refetchInterval: 5000,
  });
}
