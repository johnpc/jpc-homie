import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const haUrl = process.env.HOME_ASSISTANT_URL;
  const haToken = process.env.HOME_ASSISTANT_TOKEN;

  if (!haUrl || !haToken) {
    return NextResponse.json({ error: 'Missing configuration' }, { status: 500 });
  }

  try {
    const { action } = await request.json();
    const service = action === 'on' ? 'turn_on' : 'turn_off';

    // Toggle both stair switches
    await Promise.all([
      fetch(`${haUrl}/api/services/switch/${service}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${haToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ entity_id: 'switch.smart_plug_3_socket_1' }),
      }),
      fetch(`${haUrl}/api/services/switch/${service}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${haToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ entity_id: 'switch.heated_stairs_3_socket_1' }),
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to toggle stairs' }, { status: 500 });
  }
}
