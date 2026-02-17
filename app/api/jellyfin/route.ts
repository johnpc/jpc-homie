import { NextRequest, NextResponse } from 'next/server';

const JELLYFIN_URL = process.env.JELLYFIN_URL;
const JELLYFIN_API_KEY = process.env.JELLYFIN_API_KEY;

async function jellyfinFetch(endpoint: string) {
  const response = await fetch(`${JELLYFIN_URL}${endpoint}`, {
    headers: { 'X-Emby-Token': JELLYFIN_API_KEY || '' },
  });
  if (!response.ok) throw new Error('Jellyfin API error');
  return response.json();
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  try {
    switch (action) {
      case 'artists': {
        const searchTerm = searchParams.get('searchTerm');
        const query = searchTerm ? `?searchTerm=${encodeURIComponent(searchTerm)}` : '';
        const data = await jellyfinFetch(`/Artists${query}`);
        return NextResponse.json(data.Items || []);
      }
      case 'artistTracks': {
        const artistId = searchParams.get('artistId');
        const data = await jellyfinFetch(
          `/Items?ArtistIds=${artistId}&IncludeItemTypes=Audio&Recursive=true&Limit=100`
        );
        return NextResponse.json(data.Items || []);
      }
      case 'playlists': {
        const data = await jellyfinFetch('/Items?IncludeItemTypes=Playlist&Recursive=true');
        return NextResponse.json(data.Items || []);
      }
      case 'albumTracks': {
        const albumId = searchParams.get('albumId');
        const data = await jellyfinFetch(
          `/Items?ParentId=${albumId}&IncludeItemTypes=Audio&Recursive=true`
        );
        return NextResponse.json(data.Items || []);
      }
      case 'search': {
        const term = searchParams.get('term') || '';
        const [artists, albums, tracks] = await Promise.all([
          jellyfinFetch(`/Artists?searchTerm=${encodeURIComponent(term)}&Limit=20`),
          jellyfinFetch(
            `/Items?searchTerm=${encodeURIComponent(term)}&IncludeItemTypes=MusicAlbum&Recursive=true&Limit=20`
          ),
          jellyfinFetch(
            `/Items?searchTerm=${encodeURIComponent(term)}&IncludeItemTypes=Audio&Recursive=true&Limit=30`
          ),
        ]);
        return NextResponse.json({
          artists: artists.Items || [],
          albums: albums.Items || [],
          tracks: tracks.Items || [],
        });
      }
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Jellyfin API error' }, { status: 500 });
  }
}
