import { NextRequest, NextResponse } from 'next/server';
import WebSocket from 'ws';

export async function POST(req: NextRequest) {
  try {
    const { from_index, to_index } = await req.json();

    const haUrl = process.env.HOME_ASSISTANT_URL;
    const haToken = process.env.HOME_ASSISTANT_TOKEN;
    const maUrl = process.env.MUSIC_ASSISTANT_URL || 'http://192.168.4.56:8095';
    const maToken = process.env.MUSIC_ASSISTANT_TOKEN;

    if (!haUrl || !haToken || !maToken) {
      return NextResponse.json({ error: 'Configuration missing' }, { status: 500 });
    }

    // Get queue info
    const queueResponse = await fetch(
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

    if (!queueResponse.ok) {
      return NextResponse.json({ error: 'Failed to get queue' }, { status: 500 });
    }

    const queueData = await queueResponse.json();
    const queue = queueData.service_response?.['media_player.living_room_sonos'];

    if (!queue?.queue_id) {
      return NextResponse.json({ error: 'Queue not found' }, { status: 404 });
    }

    // Get full queue to find the queue_item_id
    const itemsResponse = await fetch(`${maUrl}/api`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${maToken}`,
      },
      body: JSON.stringify({
        message_id: '1',
        command: 'player_queues/items',
        args: {
          queue_id: queue.queue_id,
          limit: 500,
        },
      }),
    });

    const items = await itemsResponse.json();
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Queue items not found' }, { status: 404 });
    }

    const itemToMove = items[from_index];
    if (!itemToMove) {
      return NextResponse.json({ error: 'Item not found at index' }, { status: 404 });
    }

    // Calculate position shift
    const pos_shift = to_index - from_index;

    // Use WebSocket to send the command
    const wsUrl = maUrl.replace('http://', 'ws://').replace('https://', 'wss://') + '/ws';

    const result = await new Promise<NextResponse>((resolve) => {
      const ws = new WebSocket(wsUrl);
      let authenticated = false;

      ws.on('open', () => {
        // Send auth message
        ws.send(
          JSON.stringify({
            message_id: 'auth',
            command: 'auth',
            args: { token: maToken },
          })
        );
      });

      ws.on('message', (data: Buffer) => {
        const message = JSON.parse(data.toString());

        if (!authenticated && message.message_id === 'auth') {
          authenticated = true;
          // Send move command
          ws.send(
            JSON.stringify({
              message_id: 'move',
              command: 'player_queues/move_item',
              args: {
                queue_id: queue.queue_id,
                queue_item_id: itemToMove.queue_item_id,
                pos_shift,
              },
            })
          );
        } else if (message.message_id === 'move') {
          ws.close();
          if (message.error) {
            resolve(
              NextResponse.json({ error: 'Move failed', details: message.error }, { status: 500 })
            );
          } else {
            resolve(NextResponse.json({ success: true }));
          }
        }
      });

      ws.on('error', (error) => {
        ws.close();
        resolve(
          NextResponse.json({ error: 'WebSocket error', details: error.message }, { status: 500 })
        );
      });

      // Timeout after 5 seconds
      setTimeout(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.close();
          resolve(NextResponse.json({ error: 'Request timeout' }, { status: 408 }));
        }
      }, 5000);
    });

    return result;
  } catch (error) {
    console.error('Reorder queue error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
