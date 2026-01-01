import { NextResponse } from 'next/server';

export async function GET() {
  const haUrl = process.env.HOME_ASSISTANT_URL;
  const haToken = process.env.HOME_ASSISTANT_TOKEN;

  if (!haUrl || !haToken) {
    return NextResponse.json({ error: 'Home Assistant not configured' }, { status: 500 });
  }

  const response = await fetch(`${haUrl}/api/states`, {
    headers: { Authorization: `Bearer ${haToken}` },
  });

  if (!response.ok) {
    return NextResponse.json({ error: 'Failed to fetch states' }, { status: 500 });
  }

  const entities = await response.json();
  const mediaPlayers = entities.filter((e: { entity_id: string }) =>
    e.entity_id.startsWith('media_player.')
  );

  return NextResponse.json(mediaPlayers);
}
