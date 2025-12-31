import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const haUrl = process.env.HOME_ASSISTANT_URL;
  const haToken = process.env.HOME_ASSISTANT_TOKEN;

  if (!haUrl || !haToken) {
    return NextResponse.json({ error: 'Missing configuration' }, { status: 500 });
  }

  try {
    const { low, high, mode, scale } = await request.json();

    // Set temperature range
    const rangeResponse = await fetch(`${haUrl}/api/services/rest_command/set_thermostat_range`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${haToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ low, high, scale }),
    });

    // Set mode to heat-cool
    const modeResponse = await fetch(`${haUrl}/api/services/rest_command/set_thermostat_mode`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${haToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ mode }),
    });

    if (!rangeResponse.ok || !modeResponse.ok) {
      throw new Error('Failed to set temperature range or mode');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to set temperature range' }, { status: 500 });
  }
}
