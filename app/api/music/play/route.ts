import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { track, artist } = await req.json();

    const haUrl = process.env.HOME_ASSISTANT_URL;
    const haToken = process.env.HOME_ASSISTANT_TOKEN;
    const jellyfinUrl = process.env.JELLYFIN_URL;
    const jellyfinApiKey = process.env.JELLYFIN_API_KEY;

    if (!haUrl || !haToken) {
      return NextResponse.json({ error: 'Home Assistant not configured' }, { status: 500 });
    }

    // Search Jellyfin for exact track name
    if (jellyfinUrl && jellyfinApiKey) {
      const searchTerm = track;

      const searchUrl = `${jellyfinUrl}/Items?searchTerm=${encodeURIComponent(searchTerm)}&IncludeItemTypes=Audio&Recursive=true&Limit=50&api_key=${jellyfinApiKey}`;
      const searchResponse = await fetch(searchUrl);

      if (searchResponse.ok) {
        const searchResults = await searchResponse.json();
        let items = searchResults.Items || [];

        if (artist && items.length > 0) {
          items = items.filter((item: { Artists?: string[] }) =>
            item.Artists?.some((a: string) => a.toLowerCase().includes(artist.toLowerCase()))
          );
        }

        if (items.length > 0) {
          const itemName = items[0].Name;

          const playResponse = await fetch(`${haUrl}/api/services/media_player/play_media`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${haToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              entity_id: 'media_player.living_room_sonos',
              media_content_id: itemName,
              media_content_type: 'track',
            }),
          });

          if (!playResponse.ok) {
            const errorText = await playResponse.text();
            return NextResponse.json(
              { error: 'Failed to play', details: errorText },
              { status: 500 }
            );
          }

          return NextResponse.json({ success: true });
        }
      }
    }

    // Fallback to artist search if Jellyfin search fails or not configured
    const searchTerm = artist || track;
    const playResponse = await fetch(`${haUrl}/api/services/media_player/play_media`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${haToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        entity_id: 'media_player.living_room_sonos',
        media_content_id: searchTerm,
        media_content_type: artist ? 'artist' : 'track',
      }),
    });

    if (!playResponse.ok) {
      const errorText = await playResponse.text();
      return NextResponse.json({ error: 'Failed to play', details: errorText }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Play music error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
