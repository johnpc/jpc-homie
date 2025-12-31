import { NextResponse } from 'next/server';

export async function GET() {
  const haUrl = process.env.HOME_ASSISTANT_URL;
  const haToken = process.env.HOME_ASSISTANT_TOKEN;

  if (!haUrl || !haToken) {
    return NextResponse.json({ error: 'Missing configuration' }, { status: 500 });
  }

  try {
    const [currentTemp, targetTemp, mode, heating] = await Promise.all([
      fetch(`${haUrl}/api/states/sensor.thermostat_current_temp`, {
        headers: { Authorization: `Bearer ${haToken}` },
      }),
      fetch(`${haUrl}/api/states/sensor.thermostat_target_temp`, {
        headers: { Authorization: `Bearer ${haToken}` },
      }),
      fetch(`${haUrl}/api/states/sensor.thermostat_mode`, {
        headers: { Authorization: `Bearer ${haToken}` },
      }),
      fetch(`${haUrl}/api/states/sensor.thermostat_heating`, {
        headers: { Authorization: `Bearer ${haToken}` },
      }),
    ]);

    const data = await Promise.all([
      currentTemp.json(),
      targetTemp.json(),
      mode.json(),
      heating.json(),
    ]);

    // Normalize to Celsius - currentTemp comes as F, targetTemp as C
    const currentTempC = ((parseFloat(data[0].state) - 32) * 5) / 9;
    const targetTempC = parseFloat(data[1].state);

    return NextResponse.json({
      currentTemp: currentTempC,
      targetTemp: targetTempC,
      mode: data[2].state,
      heating: data[3].state === 'True',
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

    const response = await fetch(`${haUrl}/api/services/rest_command/set_thermostat_temp`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${haToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ value, mode, scale }),
    });

    if (!response.ok) {
      throw new Error('Failed to set temperature');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to set temperature' }, { status: 500 });
  }
}
