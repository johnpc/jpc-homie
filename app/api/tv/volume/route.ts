import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const rokuIp = process.env.ROKU_TV_IP || '192.168.4.177';
  const { direction } = await request.json();

  try {
    let endpoint = '';
    if (direction === 'up') {
      endpoint = 'VolumeUp';
    } else if (direction === 'down') {
      endpoint = 'VolumeDown';
    } else if (direction === 'mute') {
      endpoint = 'VolumeMute';
    }

    if (endpoint) {
      const response = await fetch(`http://${rokuIp}:8060/keypress/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
      });

      if (!response.ok) {
        return NextResponse.json({ error: 'Roku API failed' }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Volume control error:', e);
    return NextResponse.json({ error: 'Failed to set volume' }, { status: 500 });
  }
}
