import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const haUrl = process.env.HOME_ASSISTANT_URL;
  const haToken = process.env.HOME_ASSISTANT_TOKEN;

  if (!haUrl || !haToken) {
    return NextResponse.json({ error: 'Missing configuration' }, { status: 500 });
  }

  try {
    const { action } = await request.json();

    // Get all light entities
    const statesRes = await fetch(`${haUrl}/api/states`, {
      headers: { Authorization: `Bearer ${haToken}` },
    });
    const entities = await statesRes.json();
    const lights = entities
      .filter((e: { entity_id: string }) => e.entity_id.startsWith('light.'))
      .map((e: { entity_id: string }) => e.entity_id);

    if (action === 'all_on') {
      await fetch(`${haUrl}/api/services/light/turn_on`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${haToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ entity_id: lights }),
      });
    } else if (action === 'all_off') {
      await fetch(`${haUrl}/api/services/light/turn_off`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${haToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ entity_id: lights }),
      });
    } else if (action === 'all_blue') {
      await fetch(`${haUrl}/api/services/light/turn_on`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${haToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ entity_id: lights, rgb_color: [0, 0, 255] }),
      });
    } else if (action === 'all_red') {
      await fetch(`${haUrl}/api/services/light/turn_on`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${haToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ entity_id: lights, rgb_color: [255, 0, 0] }),
      });
    } else if (action === 'all_random') {
      // Turn on each light with a random color
      await Promise.all(
        lights.map((light: string) =>
          fetch(`${haUrl}/api/services/light/turn_on`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${haToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              entity_id: light,
              rgb_color: [
                Math.floor(Math.random() * 256),
                Math.floor(Math.random() * 256),
                Math.floor(Math.random() * 256),
              ],
            }),
          })
        )
      );
    } else if (action === 'all_bright') {
      await fetch(`${haUrl}/api/services/light/turn_on`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${haToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entity_id: lights,
          brightness: 255,
          color_temp: 370, // Warm white
        }),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to control lights' }, { status: 500 });
  }
}
