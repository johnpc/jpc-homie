'use client';

import { useQuery } from '@tanstack/react-query';
import { jellyfinService, JellyfinTrack, SearchResults } from '@/lib/jellyfin';
import { useState, useEffect } from 'react';

interface NowPlaying {
  state: string;
  title?: string;
  artist?: string;
  album?: string;
}

export default function MusicBrowser() {
  const [view, setView] = useState<'artists' | 'playlists' | 'search'>('artists');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedArtistId, setSelectedArtistId] = useState<string | null>(null);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState({
    artists: true,
    albums: true,
    tracks: true,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: nowPlaying, refetch: refetchStatus } = useQuery<NowPlaying>({
    queryKey: ['nowPlaying'],
    queryFn: async () => {
      const res = await fetch('/api/music/status');
      return res.json();
    },
    refetchInterval: 5000,
  });

  const { data: artists, isLoading: artistsLoading } = useQuery({
    queryKey: ['artists'],
    queryFn: () => jellyfinService.getArtists(),
  });

  const { data: playlists, isLoading: playlistsLoading } = useQuery({
    queryKey: ['playlists'],
    queryFn: () => jellyfinService.getPlaylists(),
  });

  const { data: artistTracks, isLoading: artistTracksLoading } = useQuery({
    queryKey: ['artistTracks', selectedArtistId],
    queryFn: () => jellyfinService.getArtistTracks(selectedArtistId!),
    enabled: !!selectedArtistId,
  });

  const { data: albumTracks, isLoading: albumTracksLoading } = useQuery({
    queryKey: ['albumTracks', selectedAlbumId],
    queryFn: () => jellyfinService.getAlbumTracks(selectedAlbumId!),
    enabled: !!selectedAlbumId,
  });

  const { data: playlistTracks, isLoading: playlistTracksLoading } = useQuery({
    queryKey: ['playlistTracks', selectedPlaylistId],
    queryFn: () => jellyfinService.getPlaylistTracks(selectedPlaylistId!),
    enabled: !!selectedPlaylistId,
  });

  const { data: searchResults, isLoading: searchLoading } = useQuery<SearchResults>({
    queryKey: ['search', debouncedSearch],
    queryFn: () => jellyfinService.searchAll(debouncedSearch),
    enabled: debouncedSearch.length > 2,
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
      refetchStatus();
    } catch (error) {
      console.error('Failed to play track:', error);
    }
  };

  const controlMedia = async (
    action: 'media_play_pause' | 'media_stop' | 'media_next_track' | 'media_previous_track'
  ) => {
    try {
      await fetch('/api/music/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      refetchStatus();
    } catch (error) {
      console.error('Failed to control media:', error);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-lg shadow-lg">
      {/* Now Playing Bar */}
      {nowPlaying?.title && (
        <div className="p-4 bg-gradient-to-r from-green-500 to-teal-600 text-white border-b">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="font-semibold truncate">{nowPlaying.title}</div>
              <div className="text-sm opacity-90 truncate">
                {nowPlaying.artist} {nowPlaying.album && `• ${nowPlaying.album}`}
              </div>
            </div>
            <div className="flex gap-2 ml-4">
              <button
                onClick={() => controlMedia('media_previous_track')}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition"
                title="Previous"
              >
                ⏮️
              </button>
              <button
                onClick={() => controlMedia('media_play_pause')}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition"
                title={nowPlaying.state === 'playing' ? 'Pause' : 'Play'}
              >
                {nowPlaying.state === 'playing' ? '⏸️' : '▶️'}
              </button>
              <button
                onClick={() => controlMedia('media_next_track')}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition"
                title="Next"
              >
                ⏭️
              </button>
              <button
                onClick={() => controlMedia('media_stop')}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition"
                title="Stop"
              >
                ⏹️
              </button>
            </div>
          </div>
        </div>
      )}

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
          <>
            {artistsLoading && (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}
            {!artistsLoading && (
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
          </>
        )}

        {view === 'artists' && selectedArtistId && (
          <div>
            <button
              onClick={() => setSelectedArtistId(null)}
              className="mb-4 text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to Artists
            </button>
            {artistTracksLoading && (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}
            {!artistTracksLoading && (
              <div className="space-y-2">
                {artistTracks?.map((track, idx) => (
                  <button
                    key={`${track.Id}-${idx}`}
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
            )}
          </div>
        )}

        {view === 'playlists' && !selectedPlaylistId && (
          <>
            {playlistsLoading && (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            )}
            {!playlistsLoading && (
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
          </>
        )}

        {view === 'playlists' && selectedPlaylistId && (
          <div>
            <button
              onClick={() => setSelectedPlaylistId(null)}
              className="mb-4 text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to Playlists
            </button>
            {playlistTracksLoading && (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            )}
            {!playlistTracksLoading && (
              <div className="space-y-2">
                {playlistTracks?.map((track, idx) => (
                  <button
                    key={`${track.Id}-${idx}`}
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
            )}
          </div>
        )}

        {view === 'search' && debouncedSearch.length > 2 && (
          <>
            {searchLoading && (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              </div>
            )}
            {!searchLoading && searchResults && (
              <>
                {searchResults.artists.length === 0 &&
                  searchResults.albums.length === 0 &&
                  searchResults.tracks.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                      No results found for "{debouncedSearch}"
                    </div>
                  )}
                <div className="space-y-4">
                  {/* Artists Section */}
                  {searchResults?.artists && searchResults.artists.length > 0 && (
                    <div className="border rounded-lg overflow-hidden">
                      <button
                        onClick={() =>
                          setExpandedSections((prev) => ({ ...prev, artists: !prev.artists }))
                        }
                        className="w-full p-3 bg-blue-100 hover:bg-blue-200 text-left font-semibold flex justify-between items-center text-gray-900"
                      >
                        <span>🎤 Artists ({searchResults.artists.length})</span>
                        <span>{expandedSections.artists ? '▼' : '▶'}</span>
                      </button>
                      {expandedSections.artists && (
                        <div className="p-2 space-y-2">
                          {searchResults.artists.map((artist) => (
                            <button
                              key={artist.Id}
                              onClick={() => {
                                setSelectedArtistId(artist.Id);
                                setView('artists');
                              }}
                              className="w-full p-3 bg-blue-50 hover:bg-blue-100 rounded-lg text-left transition"
                            >
                              <div className="font-medium text-gray-900">{artist.Name}</div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Albums Section */}
                  {searchResults?.albums && searchResults.albums.length > 0 && (
                    <div className="border rounded-lg overflow-hidden">
                      <button
                        onClick={() =>
                          setExpandedSections((prev) => ({ ...prev, albums: !prev.albums }))
                        }
                        className="w-full p-3 bg-purple-100 hover:bg-purple-200 text-left font-semibold flex justify-between items-center text-gray-900"
                      >
                        <span>💿 Albums ({searchResults.albums.length})</span>
                        <span>{expandedSections.albums ? '▼' : '▶'}</span>
                      </button>
                      {expandedSections.albums && (
                        <div className="p-2 space-y-2">
                          {searchResults.albums.map((album) => (
                            <button
                              key={album.Id}
                              onClick={() => setSelectedAlbumId(album.Id)}
                              className="w-full p-3 bg-purple-50 hover:bg-purple-100 rounded-lg text-left transition"
                            >
                              <div className="font-medium text-gray-900">{album.Name}</div>
                              {album.AlbumArtist && (
                                <div className="text-sm text-gray-600">{album.AlbumArtist}</div>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tracks Section */}
                  {searchResults?.tracks && searchResults.tracks.length > 0 && (
                    <div className="border rounded-lg overflow-hidden">
                      <button
                        onClick={() =>
                          setExpandedSections((prev) => ({ ...prev, tracks: !prev.tracks }))
                        }
                        className="w-full p-3 bg-green-100 hover:bg-green-200 text-left font-semibold flex justify-between items-center text-gray-900"
                      >
                        <span>🎵 Tracks ({searchResults.tracks.length})</span>
                        <span>{expandedSections.tracks ? '▼' : '▶'}</span>
                      </button>
                      {expandedSections.tracks && (
                        <div className="p-2 space-y-2">
                          {searchResults.tracks.map((track, idx) => (
                            <button
                              key={`${track.Id}-${idx}`}
                              onClick={() => playTrack(track)}
                              className="w-full p-3 bg-green-50 hover:bg-green-100 rounded-lg text-left transition flex justify-between items-center"
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
                  )}
                </div>
              </>
            )}
          </>
        )}

        {/* Album Tracks View */}
        {selectedAlbumId && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="font-semibold text-lg">Album Tracks</h3>
                <button
                  onClick={() => setSelectedAlbumId(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {albumTracksLoading && (
                  <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  </div>
                )}
                {!albumTracksLoading && (
                  <div className="space-y-2">
                    {albumTracks?.map((track, idx) => (
                      <button
                        key={`${track.Id}-${idx}`}
                        onClick={() => {
                          playTrack(track);
                          setSelectedAlbumId(null);
                        }}
                        className="w-full p-3 bg-purple-50 hover:bg-purple-100 rounded-lg text-left transition flex justify-between items-center"
                      >
                        <div>
                          <div className="font-medium text-gray-900">{track.Name}</div>
                          <div className="text-sm text-gray-600">{track.Artists?.[0]}</div>
                        </div>
                        <span className="text-2xl">▶️</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
