import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const haUrl = process.env.HOME_ASSISTANT_URL;
    const haToken = process.env.HOME_ASSISTANT_TOKEN;

    if (!haUrl || !haToken) {
      return NextResponse.json({ error: 'Home Assistant not configured' }, { status: 500 });
    }

    // First get the queue info to find the queue_id
    const queueInfoResponse = await fetch(
      `${haUrl}/api/services/music_assistant/get_queue?return_response=true`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${haToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entity_id: 'media_player.living_room_sonos',
        }),
      }
    );

    if (!queueInfoResponse.ok) {
      return NextResponse.json({ error: 'Failed to get queue info' }, { status: 500 });
    }

    const queueInfo = await queueInfoResponse.json();
    const queueData = queueInfo.service_response?.['media_player.living_room_sonos'];

    if (!queueData) {
      return NextResponse.json({ queue: [], position: 0 });
    }

    // Get the Music Assistant server URL and token
    const maUrl = process.env.MUSIC_ASSISTANT_URL || 'http://192.168.4.56:8095';
    const maToken = process.env.MUSIC_ASSISTANT_TOKEN;

    // Call Music Assistant API directly to get full queue
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (maToken) {
      headers['Authorization'] = `Bearer ${maToken}`;
    }

    const fullQueueResponse = await fetch(`${maUrl}/api`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        message_id: '1',
        command: 'player_queues/items',
        args: {
          queue_id: queueData.queue_id,
          limit: 100,
          offset: 0,
        },
      }),
    });

    if (!fullQueueResponse.ok) {
      // Fallback to just current and next if MA API fails
      return NextResponse.json({
        queue: [queueData.current_item, queueData.next_item].filter(Boolean),
        position: queueData.current_index,
        total: queueData.items,
      });
    }

    const fullQueue = await fullQueueResponse.json();

    // MA API returns an array directly, not wrapped in result
    if (Array.isArray(fullQueue) && fullQueue.length > 0) {
      return NextResponse.json({
        queue: fullQueue,
        position: queueData.current_index,
        total: queueData.items,
      });
    }

    // Fallback
    return NextResponse.json({
      queue: [queueData.current_item, queueData.next_item].filter(Boolean),
      position: queueData.current_index,
      total: queueData.items,
    });
  } catch (error) {
    console.error('Queue error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

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

    let mediaContentId = track;

    if (jellyfinUrl && jellyfinApiKey) {
      const searchUrl = `${jellyfinUrl}/Items?searchTerm=${encodeURIComponent(track)}&IncludeItemTypes=Audio&Recursive=true&Limit=50&api_key=${jellyfinApiKey}`;
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
          const item = items[0];
          const itemArtist = item.Artists?.[0];
          mediaContentId = itemArtist ? `${itemArtist} - ${item.Name}` : item.Name;
        }
      }
    }

    const response = await fetch(`${haUrl}/api/services/media_player/play_media`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${haToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        entity_id: 'media_player.living_room_sonos',
        media_content_id: mediaContentId,
        media_content_type: 'track',
        enqueue: 'add',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: 'Failed to add to queue', details: errorText },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Add to queue error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { queue_item_id } = await req.json();

    const haUrl = process.env.HOME_ASSISTANT_URL;
    const haToken = process.env.HOME_ASSISTANT_TOKEN;
    const maUrl = process.env.MUSIC_ASSISTANT_URL || 'http://192.168.4.56:8095';
    const maToken = process.env.MUSIC_ASSISTANT_TOKEN;

    if (!haUrl || !haToken || !maToken) {
      return NextResponse.json({ error: 'Configuration missing' }, { status: 500 });
    }

    // Get queue_id from Home Assistant
    const queueInfoResponse = await fetch(
      `${haUrl}/api/services/music_assistant/get_queue?return_response=true`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${haToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entity_id: 'media_player.living_room_sonos',
        }),
      }
    );

    if (!queueInfoResponse.ok) {
      return NextResponse.json({ error: 'Failed to get queue info' }, { status: 500 });
    }

    const queueInfo = await queueInfoResponse.json();
    const queueData = queueInfo.service_response?.['media_player.living_room_sonos'];

    if (!queueData?.queue_id) {
      return NextResponse.json({ error: 'Queue not found' }, { status: 404 });
    }

    const response = await fetch(`${maUrl}/api`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${maToken}`,
      },
      body: JSON.stringify({
        message_id: '1',
        command: 'player_queues/delete_item',
        args: {
          item_id_or_index: queue_item_id,
          queue_id: queueData.queue_id,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: 'Failed to remove from queue', details: errorText },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Remove from queue error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
