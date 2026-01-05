import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const haUrl = process.env.HOME_ASSISTANT_URL;
    const haToken = process.env.HOME_ASSISTANT_TOKEN;

    if (!haUrl || !haToken) {
      return NextResponse.json({ error: 'Home Assistant not configured' }, { status: 500 });
    }

    const response = await fetch(`${haUrl}/api/states/media_player.living_room_sonos`, {
      headers: {
        Authorization: `Bearer ${haToken}`,
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to get state' }, { status: 500 });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
