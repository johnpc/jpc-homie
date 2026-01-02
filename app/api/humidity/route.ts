import { NextResponse } from 'next/server';

export async function GET() {
  const haUrl = process.env.HOME_ASSISTANT_URL;
  const haToken = process.env.HOME_ASSISTANT_TOKEN;

  if (!haUrl || !haToken) {
    return NextResponse.json({ error: 'Missing configuration' }, { status: 500 });
  }

  try {
    const response = await fetch(`${haUrl}/api/states/sensor.thermostat_humidity`, {
      headers: { Authorization: `Bearer ${haToken}` },
    });

    const data = await response.json();

    return NextResponse.json({
      humidity: parseFloat(data.state) || 0,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch humidity' }, { status: 500 });
  }
}
