import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { position } = await req.json();

    const haUrl = process.env.HOME_ASSISTANT_URL;
    const haToken = process.env.HOME_ASSISTANT_TOKEN;

    if (!haUrl || !haToken) {
      return NextResponse.json({ error: 'Home Assistant not configured' }, { status: 500 });
    }

    const response = await fetch(`${haUrl}/api/services/media_player/media_seek`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${haToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        entity_id: 'media_player.living_room_sonos',
        seek_position: position,
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to seek' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Seek error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
