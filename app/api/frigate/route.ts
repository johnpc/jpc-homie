import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const frigateUrl = process.env.FRIGATE_URL;

  if (!frigateUrl) {
    return NextResponse.json({ error: 'FRIGATE_URL not configured' }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get('thumbnail');

  if (eventId) {
    const response = await fetch(`${frigateUrl}/api/events/${eventId}/thumbnail.jpg`);
    const buffer = await response.arrayBuffer();
    return new NextResponse(buffer, {
      headers: { 'Content-Type': 'image/jpeg' },
    });
  }

  try {
    const response = await fetch(`${frigateUrl}/api/events?limit=10`);
    const events = await response.json();

    const eventData = events.map(
      (event: {
        id: string;
        camera: string;
        label: string;
        start_time: number;
        has_clip: boolean;
      }) => ({
        id: event.id,
        camera: event.camera,
        label: event.label,
        startTime: new Date(event.start_time * 1000).toLocaleString('en-US', {
          timeZone: 'America/New_York',
        }),
        thumbnailUrl: `/api/frigate?thumbnail=${event.id}`,
        clipUrl: event.has_clip ? `${frigateUrl}/api/events/${event.id}/clip.mp4` : null,
      })
    );

    return NextResponse.json(eventData);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}
