'use client';

import { useQuery } from '@tanstack/react-query';
import { jellyfinService, JellyfinTrack } from '@/lib/jellyfin';
import { useState } from 'react';

export default function MusicBrowser() {
  const [view, setView] = useState<'artists' | 'playlists' | 'search'>('artists');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArtistId, setSelectedArtistId] = useState<string | null>(null);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);

  const { data: artists } = useQuery({
    queryKey: ['artists'],
    queryFn: () => jellyfinService.getArtists(),
  });

  const { data: playlists } = useQuery({
    queryKey: ['playlists'],
    queryFn: () => jellyfinService.getPlaylists(),
  });

  const { data: artistTracks } = useQuery({
    queryKey: ['artistTracks', selectedArtistId],
    queryFn: () => jellyfinService.getArtistTracks(selectedArtistId!),
    enabled: !!selectedArtistId,
  });

  const { data: playlistTracks } = useQuery({
    queryKey: ['playlistTracks', selectedPlaylistId],
    queryFn: () => jellyfinService.getPlaylistTracks(selectedPlaylistId!),
    enabled: !!selectedPlaylistId,
  });

  const { data: searchResults } = useQuery({
    queryKey: ['search', searchQuery],
    queryFn: () => jellyfinService.searchTracks(searchQuery),
    enabled: searchQuery.length > 2,
  });

  const playTrack = async (track: JellyfinTrack) => {
    try {
      await fetch('/api/music/play', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          track: track.Name,
          artist: track.Artists?.[0],
        }),
      });
    } catch (error) {
      console.error('Failed to play track:', error);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-lg shadow-lg">
      <div className="p-4 border-b bg-gradient-to-r from-blue-500 to-purple-600">
        <h2 className="text-2xl font-bold mb-4 text-white">🎵 Music Library</h2>
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => {
              setView('artists');
              setSelectedArtistId(null);
              setSelectedPlaylistId(null);
            }}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              view === 'artists'
                ? 'bg-white text-blue-600 shadow-md'
                : 'bg-blue-600 text-white hover:bg-blue-700 border-2 border-white'
            }`}
          >
            Artists
          </button>
          <button
            onClick={() => {
              setView('playlists');
              setSelectedArtistId(null);
              setSelectedPlaylistId(null);
            }}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              view === 'playlists'
                ? 'bg-white text-blue-600 shadow-md'
                : 'bg-blue-600 text-white hover:bg-blue-700 border-2 border-white'
            }`}
          >
            Playlists
          </button>
          <button
            onClick={() => {
              setView('search');
              setSelectedArtistId(null);
              setSelectedPlaylistId(null);
            }}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              view === 'search'
                ? 'bg-white text-blue-600 shadow-md'
                : 'bg-blue-600 text-white hover:bg-blue-700 border-2 border-white'
            }`}
          >
            Search
          </button>
        </div>
        {view === 'search' && (
          <input
            type="text"
            placeholder="Search for songs or artists..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg text-gray-900"
          />
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {view === 'artists' && !selectedArtistId && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {artists?.map((artist) => (
              <button
                key={artist.Id}
                onClick={() => setSelectedArtistId(artist.Id)}
                className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 rounded-lg text-left transition shadow-sm hover:shadow-md border border-blue-200"
              >
                <div className="font-semibold text-gray-900">{artist.Name}</div>
              </button>
            ))}
          </div>
        )}

        {view === 'artists' && selectedArtistId && (
          <div>
            <button
              onClick={() => setSelectedArtistId(null)}
              className="mb-4 text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to Artists
            </button>
            <div className="space-y-2">
              {artistTracks?.map((track) => (
                <button
                  key={track.Id}
                  onClick={() => playTrack(track)}
                  className="w-full p-3 bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 rounded-lg text-left transition flex justify-between items-center shadow-sm hover:shadow-md border border-blue-200"
                >
                  <div>
                    <div className="font-medium text-gray-900">{track.Name}</div>
                    <div className="text-sm text-gray-600">{track.Album}</div>
                  </div>
                  <span className="text-2xl">▶️</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {view === 'playlists' && !selectedPlaylistId && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {playlists?.map((playlist) => (
              <button
                key={playlist.Id}
                onClick={() => setSelectedPlaylistId(playlist.Id)}
                className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 rounded-lg text-left transition shadow-sm hover:shadow-md border border-purple-200"
              >
                <div className="font-semibold text-gray-900">{playlist.Name}</div>
              </button>
            ))}
          </div>
        )}

        {view === 'playlists' && selectedPlaylistId && (
          <div>
            <button
              onClick={() => setSelectedPlaylistId(null)}
              className="mb-4 text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to Playlists
            </button>
            <div className="space-y-2">
              {playlistTracks?.map((track) => (
                <button
                  key={track.Id}
                  onClick={() => playTrack(track)}
                  className="w-full p-3 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 rounded-lg text-left transition flex justify-between items-center shadow-sm hover:shadow-md border border-purple-200"
                >
                  <div>
                    <div className="font-medium text-gray-900">{track.Name}</div>
                    <div className="text-sm text-gray-600">
                      {track.Artists?.[0]} {track.Album && `• ${track.Album}`}
                    </div>
                  </div>
                  <span className="text-2xl">▶️</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {view === 'search' && searchQuery.length > 2 && (
          <div className="space-y-2">
            {searchResults?.map((track) => (
              <button
                key={track.Id}
                onClick={() => playTrack(track)}
                className="w-full p-3 bg-gradient-to-r from-green-50 to-blue-50 hover:from-green-100 hover:to-blue-100 rounded-lg text-left transition flex justify-between items-center shadow-sm hover:shadow-md border border-green-200"
              >
                <div>
                  <div className="font-medium text-gray-900">{track.Name}</div>
                  <div className="text-sm text-gray-600">
                    {track.Artists?.[0]} {track.Album && `• ${track.Album}`}
                  </div>
                </div>
                <span className="text-2xl">▶️</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
