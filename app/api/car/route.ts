import { NextResponse } from 'next/server';

interface Entity {
  entity_id: string;
  state: string;
  attributes: Record<string, unknown>;
  last_changed?: string;
}

export interface CarData {
  battery: number;
  range: number;
  charging: string;
  chargeLimit: number;
  timeToFull: string;
  insideTemp: number;
  outsideTemp: number;
  odometer: number;
  locked: boolean;
  sentryMode: boolean;
  location: { lat: number; lon: number } | null;
  isHome: boolean;
  tirePressure: {
    frontLeft: number;
    frontRight: number;
    rearLeft: number;
    rearRight: number;
  };
  garage: { state: string; lastChanged: string };
  climate: { state: string; currentTemp: number; targetTemp: number };
  update: { available: boolean; installed: string; latest: string };
  chargingCost: {
    kWh: number;
    cost: number;
    sessions: { date: string; kWh: number; cost: number; miles: number; rate: number }[];
  } | null;
}

// DTE Time-of-Use rates ($/kWh)
function getDTERate(timestamp: number): number {
  const date = new Date(timestamp * 1000);
  const hour = date.getHours();
  const day = date.getDay(); // 0=Sun, 6=Sat
  const month = date.getMonth(); // 0=Jan, 5=Jun, 8=Sep
  const isWeekend = day === 0 || day === 6;
  const isSummer = month >= 5 && month <= 8; // Jun-Sep

  // Super off-peak: 1am-7am (all days)
  if (hour >= 1 && hour < 7) return 0.11;

  // Weekends are all off-peak
  if (isWeekend) return 0.155;

  // Peak: 3pm-7pm weekdays
  if (hour >= 15 && hour < 19) {
    return isSummer ? 0.21 : 0.17;
  }

  // Off-peak: all other times
  return 0.155;
}

export async function GET() {
  const haUrl = process.env.HOME_ASSISTANT_URL;
  const haToken = process.env.HOME_ASSISTANT_TOKEN;
  const tessieKey = process.env.TESSIE_API_KEY;
  const VIN = process.env.TESSIE_VIN || '5YJYGDEE2MF198095';

  if (!haUrl || !haToken) {
    return NextResponse.json({ error: 'Home Assistant not configured' }, { status: 500 });
  }

  // Fetch HA states and Tessie charges in parallel
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const fromTs = Math.floor(startOfMonth.getTime() / 1000);

  const [haResponse, tessieResponse] = await Promise.all([
    fetch(`${haUrl}/api/states`, { headers: { Authorization: `Bearer ${haToken}` } }),
    tessieKey
      ? fetch(`https://api.tessie.com/${VIN}/charges?from=${fromTs}`, {
          headers: { Authorization: `Bearer ${tessieKey}` },
        }).catch(() => null)
      : Promise.resolve(null),
  ]);

  const entities: Entity[] = await haResponse.json();
  const get = (id: string) => entities.find((e) => e.entity_id === id);

  // Calculate charging cost from Tessie using DTE time-of-use rates
  let chargingCost: {
    kWh: number;
    cost: number;
    sessions: { date: string; kWh: number; cost: number; miles: number; rate: number }[];
  } | null = null;
  if (tessieResponse?.ok) {
    const charges = await tessieResponse.json();
    const sessions = (charges.results || []).map(
      (c: { started_at: number; ended_at: number; energy_added: number; miles_added: number }) => {
        // Use midpoint of charge session for rate calculation
        const midpoint = Math.floor((c.started_at + c.ended_at) / 2);
        const rate = getDTERate(midpoint);
        return {
          date: new Date(c.ended_at * 1000).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          }),
          kWh: Math.round(c.energy_added * 10) / 10,
          cost: Math.round(c.energy_added * rate * 100) / 100,
          miles: Math.round(c.miles_added),
          rate,
        };
      }
    );
    const totalKwh = sessions.reduce((sum: number, s: { kWh: number }) => sum + s.kWh, 0);
    const totalCost = sessions.reduce((sum: number, s: { cost: number }) => sum + s.cost, 0);
    if (totalKwh > 0) {
      chargingCost = {
        kWh: Math.round(totalKwh * 10) / 10,
        cost: Math.round(totalCost * 100) / 100,
        sessions,
      };
    }
  }

  const location = get('device_tracker.tesla_location');
  const lat = location?.attributes.latitude as number | undefined;
  const lon = location?.attributes.longitude as number | undefined;

  // Home coordinates (758 S Maple, Ann Arbor)
  const HOME_LAT = 42.2726;
  const HOME_LON = -83.7805;
  const isHome =
    lat && lon ? Math.abs(lat - HOME_LAT) < 0.005 && Math.abs(lon - HOME_LON) < 0.005 : false;

  const data: CarData = {
    battery: parseFloat(get('sensor.tesla_battery_level')?.state || '0'),
    range: parseFloat(get('sensor.tesla_battery_range')?.state || '0'),
    charging: get('sensor.tesla_charging')?.state || 'unknown',
    chargeLimit: parseFloat(get('number.tesla_charge_limit')?.state || '0'),
    timeToFull: get('sensor.tesla_time_to_full_charge')?.state || '',
    insideTemp: parseFloat(get('sensor.tesla_inside_temperature')?.state || '0'),
    outsideTemp: parseFloat(get('sensor.tesla_outside_temperature')?.state || '0'),
    odometer: parseFloat(get('sensor.tesla_odometer')?.state || '0'),
    locked: get('lock.tesla_lock')?.state === 'locked',
    sentryMode: get('switch.tesla_sentry_mode')?.state === 'on',
    location: lat && lon ? { lat, lon } : null,
    isHome,
    tirePressure: {
      frontLeft: parseFloat(get('sensor.tesla_tire_pressure_front_left')?.state || '0'),
      frontRight: parseFloat(get('sensor.tesla_tire_pressure_front_right')?.state || '0'),
      rearLeft: parseFloat(get('sensor.tesla_tire_pressure_rear_left')?.state || '0'),
      rearRight: parseFloat(get('sensor.tesla_tire_pressure_rear_right')?.state || '0'),
    },
    garage: {
      state: get('cover.ratgdov25i_abf3bf_door')?.state || 'unknown',
      lastChanged: get('cover.ratgdov25i_abf3bf_door')?.last_changed || '',
    },
    climate: {
      state: get('climate.tesla_climate')?.state || 'off',
      currentTemp: (get('climate.tesla_climate')?.attributes.current_temperature as number) || 0,
      targetTemp: (get('climate.tesla_climate')?.attributes.temperature as number) || 70,
    },
    update: {
      available: get('update.tesla_update')?.state === 'on',
      installed: (get('update.tesla_update')?.attributes.installed_version as string) || '',
      latest: (get('update.tesla_update')?.attributes.latest_version as string) || '',
    },
    chargingCost,
  };

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const haUrl = process.env.HOME_ASSISTANT_URL;
  const haToken = process.env.HOME_ASSISTANT_TOKEN;

  if (!haUrl || !haToken) {
    return NextResponse.json({ error: 'Missing configuration' }, { status: 500 });
  }

  const { action } = await request.json();

  const actions: Record<string, { domain: string; service: string; entity: string }> = {
    lock: { domain: 'lock', service: 'lock', entity: 'lock.tesla_lock' },
    unlock: { domain: 'lock', service: 'unlock', entity: 'lock.tesla_lock' },
    sentry_on: { domain: 'switch', service: 'turn_on', entity: 'switch.tesla_sentry_mode' },
    sentry_off: { domain: 'switch', service: 'turn_off', entity: 'switch.tesla_sentry_mode' },
    wake: { domain: 'button', service: 'press', entity: 'button.tesla_wake' },
    honk: { domain: 'button', service: 'press', entity: 'button.tesla_honk_horn' },
    flash: { domain: 'button', service: 'press', entity: 'button.tesla_flash_lights' },
    trunk: { domain: 'cover', service: 'toggle', entity: 'cover.tesla_trunk' },
    frunk: { domain: 'cover', service: 'toggle', entity: 'cover.tesla_frunk' },
    garage: { domain: 'cover', service: 'toggle', entity: 'cover.ratgdov25i_abf3bf_door' },
    climate_on: { domain: 'climate', service: 'turn_on', entity: 'climate.tesla_climate' },
    climate_off: { domain: 'climate', service: 'turn_off', entity: 'climate.tesla_climate' },
  };

  const cmd = actions[action];
  if (!cmd) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }

  await fetch(`${haUrl}/api/services/${cmd.domain}/${cmd.service}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${haToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ entity_id: cmd.entity }),
  });

  return NextResponse.json({ success: true });
}
