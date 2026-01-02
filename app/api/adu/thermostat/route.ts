import { NextResponse } from 'next/server';

export async function GET() {
  const haUrl = process.env.HOME_ASSISTANT_URL;
  const haToken = process.env.HOME_ASSISTANT_TOKEN;

  if (!haUrl || !haToken) {
    return NextResponse.json({ error: 'Missing configuration' }, { status: 500 });
  }

  try {
    const response = await fetch(`${haUrl}/api/states/climate.my_ecobee`, {
      headers: { Authorization: `Bearer ${haToken}` },
    });
    const data = await response.json();

    return NextResponse.json({
      currentTemp: data.attributes.current_temperature,
      targetTemp: data.attributes.temperature,
      targetLow: data.attributes.target_temp_low,
      targetHigh: data.attributes.target_temp_high,
      mode: data.state,
      humidity: data.attributes.current_humidity,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch thermostat state' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const haUrl = process.env.HOME_ASSISTANT_URL;
  const haToken = process.env.HOME_ASSISTANT_TOKEN;

  if (!haUrl || !haToken) {
    return NextResponse.json({ error: 'Missing configuration' }, { status: 500 });
  }

  try {
    const { mode, temperature, targetLow, targetHigh } = await request.json();

    if (mode) {
      await fetch(`${haUrl}/api/services/climate/set_hvac_mode`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${haToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ entity_id: 'climate.my_ecobee', hvac_mode: mode }),
      });
    }

    if (mode === 'heat_cool' && targetLow !== undefined && targetHigh !== undefined) {
      await fetch(`${haUrl}/api/services/climate/set_temperature`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${haToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entity_id: 'climate.my_ecobee',
          target_temp_low: targetLow,
          target_temp_high: targetHigh,
        }),
      });
    } else if (temperature !== undefined) {
      await fetch(`${haUrl}/api/services/climate/set_temperature`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${haToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ entity_id: 'climate.my_ecobee', temperature }),
      });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to control thermostat' }, { status: 500 });
  }
}
