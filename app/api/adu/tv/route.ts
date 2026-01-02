import { NextResponse } from 'next/server';

export async function GET() {
  const haUrl = process.env.HOME_ASSISTANT_URL;
  const haToken = process.env.HOME_ASSISTANT_TOKEN;

  if (!haUrl || !haToken) {
    return NextResponse.json({ error: 'Missing configuration' }, { status: 500 });
  }

  try {
    const response = await fetch(
      `${haUrl}/api/states/media_player.lg_webos_tv_75ua7700pua_cusfbh`,
      {
        headers: { Authorization: `Bearer ${haToken}` },
      }
    );
    const data = await response.json();

    return NextResponse.json({
      state: data.state,
      isMuted: data.attributes.is_volume_muted,
      appName: data.attributes.app_name,
      appId: data.attributes.app_id,
      mediaTitle: data.attributes.media_title,
      source: data.attributes.source,
      volumeLevel: data.attributes.volume_level,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch TV state' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const haUrl = process.env.HOME_ASSISTANT_URL;
  const haToken = process.env.HOME_ASSISTANT_TOKEN;

  if (!haUrl || !haToken) {
    return NextResponse.json({ error: 'Missing configuration' }, { status: 500 });
  }

  try {
    const { action } = await request.json();

    const service = action === 'toggle' ? 'turn_off' : action;

    await fetch(`${haUrl}/api/services/media_player/${service}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${haToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ entity_id: 'media_player.lg_webos_tv_75ua7700pua_cusfbh' }),
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to control TV' }, { status: 500 });
  }
}
