import { NextResponse } from 'next/server';

interface Entity {
  entity_id: string;
  state: string;
  attributes: Record<string, unknown>;
  last_changed: string;
}

interface DashboardData {
  stairs: { on: number; total: number };
  locks: { locked: number; total: number };
  garage: { state: string; time: string };
  power: { kw: number; kwh: number; cost: number };
  lights: number;
  lightsBrightness: number;
}

export async function GET() {
  const haUrl = process.env.HOME_ASSISTANT_URL;
  const haToken = process.env.HOME_ASSISTANT_TOKEN;

  if (!haUrl || !haToken) {
    return NextResponse.json({ error: 'Home Assistant not configured' }, { status: 500 });
  }

  const response = await fetch(`${haUrl}/api/states`, {
    headers: { Authorization: `Bearer ${haToken}` },
  });

  const entities: Entity[] = await response.json();

  // Stairs
  const stairs = entities.filter(
    (e) =>
      e.entity_id === 'switch.smart_plug_3_socket_1' ||
      e.entity_id === 'switch.heated_stairs_3_socket_1'
  );
  const stairsOn = stairs.filter((s) => s.state === 'on').length;

  // Locks
  const locks = entities.filter((e) => ['lock.back_door', 'lock.front_door'].includes(e.entity_id));
  const locksLocked = locks.filter((l) => l.state === 'locked').length;

  // Garage
  const garage = entities.find((e) => e.entity_id.startsWith('cover.'));
  const garageTime = garage?.last_changed
    ? new Date(garage.last_changed).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        timeZone: 'America/New_York',
      })
    : '';

  // Power
  const power = entities.find((e) => e.entity_id === 'sensor.dte_instantaneous_demand');
  const monthlyEnergy = entities.find((e) => e.entity_id === 'sensor.monthly_energy');
  const powerKw = parseFloat(power?.state || '0') / 1000;
  const energyKwh = parseFloat(monthlyEnergy?.state || '0') * 60;
  const costDollars = energyKwh * 0.17;

  // Lights
  const lightEntities = entities.filter((e) => e.entity_id.startsWith('light.'));
  const lightsOn = lightEntities.filter((e) => e.state === 'on');
  const avgBrightness =
    lightsOn.length > 0
      ? Math.round(
          lightsOn.reduce((sum, light) => {
            const brightness = (light.attributes.brightness as number) || 255;
            return sum + (brightness / 255) * 100;
          }, 0) / lightsOn.length
        )
      : 0;

  const data: DashboardData = {
    stairs: { on: stairsOn, total: stairs.length },
    locks: { locked: locksLocked, total: locks.length },
    garage: { state: garage?.state || 'unknown', time: garageTime },
    power: { kw: powerKw, kwh: energyKwh, cost: costDollars },
    lights: lightsOn.length,
    lightsBrightness: avgBrightness,
  };

  return NextResponse.json(data);
}
