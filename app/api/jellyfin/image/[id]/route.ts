import { NextRequest } from 'next/server';

const JELLYFIN_URL = process.env.JELLYFIN_URL;
const JELLYFIN_API_KEY = process.env.JELLYFIN_API_KEY;

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const maxHeight = searchParams.get('maxHeight') || '200';
  const quality = searchParams.get('quality') || '90';

  const response = await fetch(
    `${JELLYFIN_URL}/Items/${id}/Images/Primary?maxHeight=${maxHeight}&quality=${quality}`,
    { headers: { 'X-Emby-Token': JELLYFIN_API_KEY || '' } }
  );

  if (!response.ok) {
    return new Response(null, { status: response.status });
  }

  const blob = await response.blob();
  return new Response(blob, {
    headers: {
      'Content-Type': response.headers.get('Content-Type') || 'image/jpeg',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
