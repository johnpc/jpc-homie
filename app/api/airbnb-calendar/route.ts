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
    let currentEvent: { start?: Date; end?: Date; summary?: string; phone?: string } | null = null;
    let currentField = '';
    let fieldValue = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.startsWith('BEGIN:VEVENT')) {
        currentEvent = {};
        currentField = '';
        fieldValue = '';
      } else if (line.startsWith('END:VEVENT') && currentEvent) {
        if (currentField === 'DESCRIPTION' && fieldValue) {
          const phoneMatch = fieldValue.match(/Phone Number \(Last 4 Digits\):\s*(\d{4})/i);
          if (phoneMatch) {
            currentEvent.phone = phoneMatch[1];
          }
        }
        events.push(currentEvent);
        currentEvent = null;
        currentField = '';
        fieldValue = '';
      } else if (currentEvent) {
        if (line.startsWith(' ') || line.startsWith('\t')) {
          fieldValue += line.trim();
        } else {
          if (currentField === 'DESCRIPTION' && fieldValue) {
            const phoneMatch = fieldValue.match(/Phone Number \(Last 4 Digits\):\s*(\d{4})/i);
            if (phoneMatch) {
              currentEvent.phone = phoneMatch[1];
            }
          }

          if (line.startsWith('DTSTART')) {
            const date = line.split(':')[1].trim();
            currentEvent.start = parseICalDate(date);
            currentField = '';
          } else if (line.startsWith('DTEND')) {
            const date = line.split(':')[1].trim();
            currentEvent.end = parseICalDate(date);
            currentField = '';
          } else if (line.startsWith('SUMMARY')) {
            currentEvent.summary = line.split(':')[1].trim();
            currentField = '';
          } else if (line.startsWith('DESCRIPTION')) {
            currentField = 'DESCRIPTION';
            fieldValue = line.split(':')[1]?.trim() || '';
          } else {
            currentField = '';
            fieldValue = '';
          }
        }
      }
    }

    return NextResponse.json({ events });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch calendar' }, { status: 500 });
  }
}
