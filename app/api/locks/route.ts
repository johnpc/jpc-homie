import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const haUrl = process.env.HOME_ASSISTANT_URL;
  const haToken = process.env.HOME_ASSISTANT_TOKEN;

  if (!haUrl || !haToken) {
    return NextResponse.json({ error: 'Missing configuration' }, { status: 500 });
  }

  try {
    const { action } = await request.json();
    const service = action === 'lock' ? 'lock' : 'unlock';

    // Toggle both locks
    await Promise.all([
      fetch(`${haUrl}/api/services/lock/${service}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${haToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ entity_id: 'lock.back_door' }),
      }),
      fetch(`${haUrl}/api/services/lock/${service}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${haToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ entity_id: 'lock.front_door' }),
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to toggle locks' }, { status: 500 });
  }
}
