import { NextResponse } from 'next/server';
import { getShieldEntityId } from '@/lib/shield';

export async function POST(request: Request) {
  const haUrl = process.env.HOME_ASSISTANT_URL;
  const haToken = process.env.HOME_ASSISTANT_TOKEN;

  if (!haUrl || !haToken) {
    return NextResponse.json({ error: 'Home Assistant not configured' }, { status: 500 });
  }

  const entityId = await getShieldEntityId();
  if (!entityId) {
    return NextResponse.json({ error: 'Shield not found' }, { status: 404 });
  }

  const { command } = await request.json();

  const response = await fetch(`${haUrl}/api/services/media_player/${command}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${haToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      entity_id: entityId,
    }),
  });

  if (!response.ok) {
    return NextResponse.json({ error: 'Failed to send command' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
