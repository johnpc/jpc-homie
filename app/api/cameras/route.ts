import { NextResponse } from 'next/server';

export async function GET() {
  const haUrl = process.env.HOME_ASSISTANT_URL;
  const haToken = process.env.HOME_ASSISTANT_TOKEN;

  if (!haUrl || !haToken) {
    return NextResponse.json({ error: 'Missing configuration' }, { status: 500 });
  }

  try {
    const cameras = [
      { id: 'front_porch', entity: 'camera.front_porch_reolink_fluent' },
      { id: 'backyard', entity: 'camera.backyard_reolink_fluent' },
    ];

    const responses = await Promise.all(
      cameras.map((camera) =>
        fetch(`${haUrl}/api/states/${camera.entity}`, {
          headers: { Authorization: `Bearer ${haToken}` },
        })
      )
    );

    const data = await Promise.all(responses.map((r) => r.json()));

    const cameraData = data
      .map((cam, i) => ({
        id: cameras[i].id,
        name: cam.attributes?.friendly_name || cameras[i].id,
        imageUrl: cam.attributes?.entity_picture
          ? `${haUrl}${cam.attributes.entity_picture}`
          : null,
      }))
      .filter((cam) => cam.imageUrl);

    return NextResponse.json(cameraData);
  } catch (error) {
    console.error('Camera fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch cameras' }, { status: 500 });
  }
}
