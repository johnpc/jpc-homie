import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const haUrl = process.env.HOME_ASSISTANT_URL;
  const haToken = process.env.HOME_ASSISTANT_TOKEN;

  if (!haUrl || !haToken) {
    return NextResponse.json({ error: 'Missing configuration' }, { status: 500 });
  }

  try {
    const { action } = await request.json();
    const service = action === 'open' ? 'open_cover' : 'close_cover';

    // Get the garage door entity
    const statesRes = await fetch(`${haUrl}/api/states`, {
      headers: { Authorization: `Bearer ${haToken}` },
    });
    const entities = await statesRes.json();
    const garage = entities.find((e: { entity_id: string }) => e.entity_id.startsWith('cover.'));

    if (!garage) {
      return NextResponse.json({ error: 'Garage door not found' }, { status: 404 });
    }

    await fetch(`${haUrl}/api/services/cover/${service}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${haToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ entity_id: garage.entity_id }),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to toggle garage' }, { status: 500 });
  }
}
