import { NextResponse } from 'next/server';

interface Room {
  id: string;
  name: string;
  lights: string[];
  lightsOn: number;
  avgBrightness: number;
  lightDetails: Array<{ id: string; name: string; on: boolean }>;
}

export async function GET() {
  const hueIp = process.env.HUE_BRIDGE_IP;
  const hueKey = process.env.HUE_API_KEY;

  if (!hueIp || !hueKey) {
    return NextResponse.json({ error: 'Hue not configured' }, { status: 500 });
  }

  try {
    // Get all rooms/groups from Hue
    const groupsRes = await fetch(`http://${hueIp}/api/${hueKey}/groups`);
    const groups = await groupsRes.json();

    // Get all lights from Hue
    const lightsRes = await fetch(`http://${hueIp}/api/${hueKey}/lights`);
    const lights = await lightsRes.json();

    const rooms: Room[] = (
      Object.entries(groups) as [string, { type: string; name: string; lights?: string[] }][]
    )
      .filter(([_, group]) => group.type === 'Room')
      .map(([id, group]) => {
        const roomLights = group.lights || [];
        const lightsOn = roomLights.filter((lightId: string) => lights[lightId]?.state?.on).length;

        const avgBrightness =
          lightsOn > 0
            ? Math.round(
                roomLights
                  .filter((lightId: string) => lights[lightId]?.state?.on)
                  .reduce((sum: number, lightId: string) => {
                    const bri = lights[lightId]?.state?.bri || 254;
                    return sum + (bri / 254) * 100;
                  }, 0) / lightsOn
              )
            : 0;

        const lightDetails = roomLights.map((lightId: string) => ({
          id: lightId,
          name: lights[lightId]?.name || `Light ${lightId}`,
          on: lights[lightId]?.state?.on || false,
        }));

        return {
          id,
          name: group.name,
          lights: roomLights,
          lightsOn,
          avgBrightness,
          lightDetails,
        };
      });

    return NextResponse.json(rooms);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch rooms' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const hueIp = process.env.HUE_BRIDGE_IP;
  const hueKey = process.env.HUE_API_KEY;

  if (!hueIp || !hueKey) {
    return NextResponse.json({ error: 'Hue not configured' }, { status: 500 });
  }

  try {
    const { groupId, action, brightness } = await request.json();

    if (action === 'set_brightness') {
      const bri = Math.round((brightness / 100) * 254);
      await fetch(`http://${hueIp}/api/${hueKey}/groups/${groupId}/action`, {
        method: 'PUT',
        body: JSON.stringify({ bri }),
      });
    } else if (action === 'all_on') {
      await fetch(`http://${hueIp}/api/${hueKey}/groups/${groupId}/action`, {
        method: 'PUT',
        body: JSON.stringify({ on: true }),
      });
    } else if (action === 'all_off') {
      await fetch(`http://${hueIp}/api/${hueKey}/groups/${groupId}/action`, {
        method: 'PUT',
        body: JSON.stringify({ on: false }),
      });
    } else if (action === 'all_blue') {
      await fetch(`http://${hueIp}/api/${hueKey}/groups/${groupId}/action`, {
        method: 'PUT',
        body: JSON.stringify({ on: true, hue: 46920, sat: 254 }),
      });
    } else if (action === 'all_red') {
      await fetch(`http://${hueIp}/api/${hueKey}/groups/${groupId}/action`, {
        method: 'PUT',
        body: JSON.stringify({ on: true, hue: 0, sat: 254 }),
      });
    } else if (action === 'all_bright') {
      await fetch(`http://${hueIp}/api/${hueKey}/groups/${groupId}/action`, {
        method: 'PUT',
        body: JSON.stringify({ on: true, bri: 254, ct: 370 }),
      });
    } else if (action === 'all_random') {
      await fetch(`http://${hueIp}/api/${hueKey}/groups/${groupId}/action`, {
        method: 'PUT',
        body: JSON.stringify({ on: true, effect: 'colorloop' }),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to control lights' }, { status: 500 });
  }
}
