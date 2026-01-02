import { NextResponse } from 'next/server';

function parseICalDate(dateStr: string): Date {
  const year = parseInt(dateStr.substring(0, 4));
  const month = parseInt(dateStr.substring(4, 6)) - 1;
  const day = parseInt(dateStr.substring(6, 8));
  return new Date(year, month, day);
}

export async function GET() {
  const icalUrl = process.env.AIRBNB_ICAL_URL;

  if (!icalUrl) {
    return NextResponse.json({ error: 'AIRBNB_ICAL_URL not configured' }, { status: 500 });
  }

  try {
    const response = await fetch(icalUrl);
    const icalData = await response.text();

    const events = [];
    const lines = icalData.split('\n');
    let currentEvent: { start?: Date; end?: Date; summary?: string } | null = null;

    for (const line of lines) {
      if (line.startsWith('BEGIN:VEVENT')) {
        currentEvent = {};
      } else if (line.startsWith('END:VEVENT') && currentEvent) {
        events.push(currentEvent);
        currentEvent = null;
      } else if (currentEvent) {
        if (line.startsWith('DTSTART')) {
          const date = line.split(':')[1].trim();
          currentEvent.start = parseICalDate(date);
        } else if (line.startsWith('DTEND')) {
          const date = line.split(':')[1].trim();
          currentEvent.end = parseICalDate(date);
        } else if (line.startsWith('SUMMARY')) {
          currentEvent.summary = line.split(':')[1].trim();
        }
      }
    }

    return NextResponse.json({ events });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch calendar' }, { status: 500 });
  }
}
