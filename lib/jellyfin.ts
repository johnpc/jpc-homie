const JELLYFIN_URL = process.env.NEXT_PUBLIC_JELLYFIN_URL;
const JELLYFIN_API_KEY = process.env.NEXT_PUBLIC_JELLYFIN_API_KEY;

export interface JellyfinArtist {
  Id: string;
  Name: string;
  Type: string;
}

export interface JellyfinTrack {
  Id: string;
  Name: string;
  Artists?: string[];
  Album?: string;
  IndexNumber?: number;
}

export interface JellyfinPlaylist {
  Id: string;
  Name: string;
  Type: string;
}

class JellyfinService {
  private async fetch<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${JELLYFIN_URL}${endpoint}`, {
      headers: {
        'X-Emby-Token': JELLYFIN_API_KEY,
      },
    });
    if (!response.ok) throw new Error('Jellyfin API error');
    return response.json();
  }

  async getArtists(searchTerm?: string): Promise<JellyfinArtist[]> {
    const query = searchTerm ? `?searchTerm=${encodeURIComponent(searchTerm)}` : '';
    const data = await this.fetch<{ Items: JellyfinArtist[] }>(`/Artists${query}`);
    return data.Items || [];
  }

  async getArtistTracks(artistId: string): Promise<JellyfinTrack[]> {
    const data = await this.fetch<{ Items: JellyfinTrack[] }>(
      `/Items?ArtistIds=${artistId}&IncludeItemTypes=Audio&Recursive=true&Limit=100`
    );
    return data.Items || [];
  }

  async searchTracks(searchTerm: string): Promise<JellyfinTrack[]> {
    const data = await this.fetch<{ Items: JellyfinTrack[] }>(
      `/Items?searchTerm=${encodeURIComponent(searchTerm)}&IncludeItemTypes=Audio&Recursive=true&Limit=50`
    );
    return data.Items || [];
  }

  async getPlaylists(): Promise<JellyfinPlaylist[]> {
    const data = await this.fetch<{ Items: JellyfinPlaylist[] }>(
      `/Items?IncludeItemTypes=Playlist&Recursive=true`
    );
    return data.Items || [];
  }

  async getPlaylistTracks(playlistId: string): Promise<JellyfinTrack[]> {
    const response = await fetch(`/api/jellyfin/playlists/${playlistId}`);
    if (!response.ok) throw new Error('Failed to fetch playlist tracks');
    const data = await response.json();
    return data.Items || [];
  }
}

export const jellyfinService = new JellyfinService();
