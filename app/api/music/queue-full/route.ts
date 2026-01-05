import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const haUrl = process.env.HOME_ASSISTANT_URL;
    const haToken = process.env.HOME_ASSISTANT_TOKEN;

    if (!haUrl || !haToken) {
      return NextResponse.json({ error: 'Home Assistant not configured' }, { status: 500 });
    }

    // Get queue info first to get queue_id
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

    // Call MA API through HA's rest_command pattern
    const maUrl = process.env.MUSIC_ASSISTANT_URL || 'http://192.168.4.56:8095';

    const fullQueueResponse = await fetch(`${maUrl}/api`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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

    const responseText = await fullQueueResponse.text();

    // If MA API fails (auth required), return current + next only
    if (responseText.includes('Authentication') || responseText.includes('Setup required')) {
      return NextResponse.json({
        queue: [queueData.current_item, queueData.next_item].filter(Boolean),
        position: queueData.current_index,
        total: queueData.items,
        limited: true,
      });
    }

    const fullQueue = JSON.parse(responseText);

    if (fullQueue.result?.items) {
      return NextResponse.json({
        queue: fullQueue.result.items,
        position: queueData.current_index,
        total: fullQueue.result.total || queueData.items,
        limited: false,
      });
    }

    // Fallback
    return NextResponse.json({
      queue: [queueData.current_item, queueData.next_item].filter(Boolean),
      position: queueData.current_index,
      total: queueData.items,
      limited: true,
    });
  } catch (error) {
    console.error('Queue error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
