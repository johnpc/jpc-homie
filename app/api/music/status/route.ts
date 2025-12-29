import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
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
      return NextResponse.json({ error: 'Failed to get status' }, { status: 500 });
    }

    const data = await response.json();
    return NextResponse.json({
      state: data.state,
      title: data.attributes.media_title,
      artist: data.attributes.media_artist,
      album: data.attributes.media_album_name,
    });
  } catch (error) {
    console.error('Status error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
