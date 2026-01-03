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
      targetLow: data.attributes.target_temp_low || 0,
      targetHigh: data.attributes.target_temp_high || 0,
      mode: data.state,
      heating: data.attributes.hvac_action === 'heating',
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
