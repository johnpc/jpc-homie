'use client';

import { useQuery } from '@tanstack/react-query';
import MobileDevicesCard from './MobileDevicesCard';
import StairsCard from './StairsCard';
import LocksCard from './LocksCard';
import GarageCard from './GarageCard';
import PowerCard from './PowerCard';
import LightsWidget from './LightsWidget';

interface DashboardData {
  stairs: { on: number; total: number };
  locks: { locked: number; total: number };
  garage: { state: string; time: string };
  power: { kw: number; kwh: number; cost: number };
  lights: number;
  lightsBrightness: number;
  allLights?: Array<{ id: string; name: string; on: boolean }>;
}

interface Room {
  id: string;
  name: string;
  lights: string[];
  lightsOn: number;
  avgBrightness: number;
  lightDetails?: Array<{ id: string; name: string; on: boolean }>;
}

export default function Dashboard() {
  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard');
      return res.json();
    },
    refetchInterval: 60000,
  });

  const { data: rooms } = useQuery<Room[]>({
    queryKey: ['rooms'],
    queryFn: async () => {
      const res = await fetch('/api/rooms');
      return res.json();
    },
    refetchInterval: 60000,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!data) return <div className="text-center text-gray-500">No data</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <StairsCard on={data.stairs.on} total={data.stairs.total} />
      <LocksCard locked={data.locks.locked} total={data.locks.total} />
      <GarageCard state={data.garage.state} time={data.garage.time} />
      <PowerCard kw={data.power.kw} kwh={data.power.kwh} cost={data.power.cost} />
      <LightsWidget
        rooms={rooms ?? []}
        allLightsOn={data.lights}
        allBrightness={data.lightsBrightness}
        allLights={data.allLights}
      />
      <MobileDevicesCard />
    </div>
  );
}
