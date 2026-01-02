import { NextResponse } from 'next/server';

export async function GET() {
  const haUrl = process.env.HOME_ASSISTANT_URL;
  const haToken = process.env.HOME_ASSISTANT_TOKEN;

  if (!haUrl || !haToken) {
    return NextResponse.json({ error: 'Missing configuration' }, { status: 500 });
  }

  try {
    const response = await fetch(`${haUrl}/api/services`, {
      headers: { Authorization: `Bearer ${haToken}` },
    });
    const services = await response.json();

    const scriptService = services.find((s: { domain: string }) => s.domain === 'script');
    const scripts = Object.entries(scriptService?.services || {})
      .filter(([key]) => !['reload', 'turn_on', 'turn_off', 'toggle'].includes(key))
      .map(([id, service]) => ({
        id,
        name:
          (service as { name?: string }).name ||
          id.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
      }));

    return NextResponse.json({ scripts });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch scripts' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const haUrl = process.env.HOME_ASSISTANT_URL;
  const haToken = process.env.HOME_ASSISTANT_TOKEN;

  if (!haUrl || !haToken) {
    return NextResponse.json({ error: 'Missing configuration' }, { status: 500 });
  }

  try {
    const { script } = await request.json();

    await fetch(`${haUrl}/api/services/script/${script}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${haToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to run script' }, { status: 500 });
  }
}
