export interface JellyfinArtist {
  Id: string;
  Name: string;
  Type: string;
  ImageTags?: { Primary?: string };
}

export interface JellyfinAlbum {
  Id: string;
  Name: string;
  AlbumArtist?: string;
  Type: string;
  ImageTags?: { Primary?: string };
}

export interface JellyfinTrack {
  Id: string;
  Name: string;
  Artists?: string[];
  Album?: string;
  AlbumId?: string;
  IndexNumber?: number;
}

export interface JellyfinPlaylist {
  Id: string;
  Name: string;
  Type: string;
  ImageTags?: { Primary?: string };
}

export interface SearchResults {
  artists: JellyfinArtist[];
  albums: JellyfinAlbum[];
  tracks: JellyfinTrack[];
}

class JellyfinService {
  async getArtists(searchTerm?: string): Promise<JellyfinArtist[]> {
    const params = new URLSearchParams({ action: 'artists' });
    if (searchTerm) params.set('searchTerm', searchTerm);
    const res = await fetch(`/api/jellyfin?${params}`);
    return res.json();
  }

  async getArtistTracks(artistId: string): Promise<JellyfinTrack[]> {
    const res = await fetch(`/api/jellyfin?action=artistTracks&artistId=${artistId}`);
    return res.json();
  }

  async searchAll(searchTerm: string): Promise<SearchResults> {
    const res = await fetch(`/api/jellyfin?action=search&term=${encodeURIComponent(searchTerm)}`);
    return res.json();
  }

  async getAlbumTracks(albumId: string): Promise<JellyfinTrack[]> {
    const res = await fetch(`/api/jellyfin?action=albumTracks&albumId=${albumId}`);
    return res.json();
  }

  async getPlaylists(): Promise<JellyfinPlaylist[]> {
    const res = await fetch(`/api/jellyfin?action=playlists`);
    return res.json();
  }

  async getPlaylistTracks(playlistId: string): Promise<JellyfinTrack[]> {
    const res = await fetch(`/api/jellyfin/playlists/${playlistId}`);
    const data = await res.json();
    return data.Items || [];
  }
}

export const jellyfinService = new JellyfinService();
