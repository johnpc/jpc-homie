import { NextResponse } from 'next/server';

export async function GET() {
  const haUrl = process.env.HOME_ASSISTANT_URL;
  const haToken = process.env.HOME_ASSISTANT_TOKEN;

  if (!haUrl || !haToken) {
    return NextResponse.json({ error: 'Missing configuration' }, { status: 500 });
  }

  try {
    const response = await fetch(`${haUrl}/api/states/lock.key_pad`, {
      headers: { Authorization: `Bearer ${haToken}` },
    });
    const data = await response.json();

    return NextResponse.json({
      state: data.state,
      last_changed: data.last_changed,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch lock state' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const haUrl = process.env.HOME_ASSISTANT_URL;
  const haToken = process.env.HOME_ASSISTANT_TOKEN;

  if (!haUrl || !haToken) {
    return NextResponse.json({ error: 'Missing configuration' }, { status: 500 });
  }

  try {
    const { action } = await request.json();

    await fetch(`${haUrl}/api/services/lock/${action}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${haToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ entity_id: 'lock.key_pad' }),
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to control lock' }, { status: 500 });
  }
}
