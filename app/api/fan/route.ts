import { NextResponse } from 'next/server';

export async function GET() {
  const haUrl = process.env.HOME_ASSISTANT_URL;
  const haToken = process.env.HOME_ASSISTANT_TOKEN;

  if (!haUrl || !haToken) {
    return NextResponse.json({ error: 'Missing configuration' }, { status: 500 });
  }

  try {
    const response = await fetch(`${haUrl}/api/states/sensor.thermostat_fan`, {
      headers: { Authorization: `Bearer ${haToken}` },
    });

    const data = await response.json();

    return NextResponse.json({
      fanMode: data.state || 'auto',
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch fan status' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const haUrl = process.env.HOME_ASSISTANT_URL;
  const haToken = process.env.HOME_ASSISTANT_TOKEN;

  if (!haUrl || !haToken) {
    return NextResponse.json({ error: 'Missing configuration' }, { status: 500 });
  }

  try {
    const { mode, duration } = await request.json();

    const response = await fetch(`${haUrl}/api/services/rest_command/set_thermostat_fan`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${haToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ mode, duration }),
    });

    if (!response.ok) {
      throw new Error('Failed to set fan state');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to set fan state' }, { status: 500 });
  }
}
