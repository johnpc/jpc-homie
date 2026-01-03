import { NextResponse } from 'next/server';

export async function GET() {
  const haUrl = process.env.HOME_ASSISTANT_URL;
  const haToken = process.env.HOME_ASSISTANT_TOKEN;

  if (!haUrl || !haToken) {
    return NextResponse.json({ error: 'Missing configuration' }, { status: 500 });
  }

  try {
    const [current, target, low, high, mode, heating] = await Promise.all([
      fetch(`${haUrl}/api/states/sensor.thermostat_current_temp`, {
        headers: { Authorization: `Bearer ${haToken}` },
      }),
      fetch(`${haUrl}/api/states/sensor.thermostat_target_temp`, {
        headers: { Authorization: `Bearer ${haToken}` },
      }),
      fetch(`${haUrl}/api/states/sensor.thermostat_target_temp_low`, {
        headers: { Authorization: `Bearer ${haToken}` },
      }),
      fetch(`${haUrl}/api/states/sensor.thermostat_target_temp_high`, {
        headers: { Authorization: `Bearer ${haToken}` },
      }),
      fetch(`${haUrl}/api/states/sensor.thermostat_mode`, {
        headers: { Authorization: `Bearer ${haToken}` },
      }),
      fetch(`${haUrl}/api/states/sensor.thermostat_heating`, {
        headers: { Authorization: `Bearer ${haToken}` },
      }),
    ]);

    const toF = (c: number) => Math.round(((c * 9) / 5 + 32) * 10) / 10;

    return NextResponse.json({
      currentTemp: parseFloat((await current.json()).state),
      targetTemp: toF(parseFloat((await target.json()).state)),
      targetLow: toF(parseFloat((await low.json()).state)),
      targetHigh: toF(parseFloat((await high.json()).state)),
      mode: (await mode.json()).state,
      heating: (await heating.json()).state === 'True',
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const haUrl = process.env.HOME_ASSISTANT_URL;
  const haToken = process.env.HOME_ASSISTANT_TOKEN;

  if (!haUrl || !haToken) {
    return NextResponse.json({ error: 'Missing configuration' }, { status: 500 });
  }

  try {
    const { value, mode, scale } = await request.json();

    // Set temperature
    const tempResponse = await fetch(`${haUrl}/api/services/rest_command/set_thermostat_temp`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${haToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ value, mode, scale }),
    });

    // Set mode
    const modeResponse = await fetch(`${haUrl}/api/services/rest_command/set_thermostat_mode`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${haToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ mode }),
    });

    if (!tempResponse.ok || !modeResponse.ok) {
      throw new Error('Failed to set temperature or mode');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to set temperature' }, { status: 500 });
  }
}
