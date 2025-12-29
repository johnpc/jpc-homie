import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const jellyfinUrl = process.env.JELLYFIN_URL;
    const jellyfinUsername = process.env.JELLYFIN_USERNAME;
    const jellyfinPassword = process.env.JELLYFIN_PASSWORD;

    if (!jellyfinUrl || !jellyfinUsername || !jellyfinPassword) {
      return NextResponse.json({ error: 'Jellyfin not configured' }, { status: 500 });
    }

    // Login to get a proper token
    const authResponse = await fetch(`${jellyfinUrl}/Users/authenticatebyname`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Emby-Authorization':
          'MediaBrowser Client="Homie", Device="Server", DeviceId="homie-server", Version="1.0.0"',
      },
      body: JSON.stringify({
        Username: jellyfinUsername,
        Pw: jellyfinPassword,
      }),
    });

    if (!authResponse.ok) {
      return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
    }

    const authData = await authResponse.json();
    const token = authData.AccessToken;

    const response = await fetch(`${jellyfinUrl}/Playlists/${id}/Items`, {
      headers: {
        'X-Emby-Token': token,
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch playlist' }, { status: 500 });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Playlist fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
