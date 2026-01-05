'use client';

import { useQuery } from '@tanstack/react-query';
import { jellyfinService, SearchResults } from '@/lib/jellyfin';
import { useState, useEffect } from 'react';
import { NowPlaying, ViewType, MediaControlAction, Queue } from './music/types';
import NowPlayingBar from './music/NowPlayingBar';
import NavigationTabs from './music/NavigationTabs';
import ArtistList from './music/ArtistList';
import ArtistDetail from './music/ArtistDetail';
import PlaylistList from './music/PlaylistList';
import PlaylistDetail from './music/PlaylistDetail';
import SearchView from './music/SearchView';
import QueueList from './music/QueueList';
import AlbumTracksModal from './music/AlbumTracksModal';

export default function MusicBrowser() {
  const [view, setView] = useState<ViewType>('artists');
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

  const { data: queue, refetch: refetchQueue } = useQuery<Queue>({
    queryKey: ['queue'],
    queryFn: async () => {
      const res = await fetch('/api/music/queue');
      return res.json();
    },
    refetchInterval: 5000,
  });

  const removeFromQueue = async (queueItemId: string) => {
    try {
      await fetch('/api/music/queue', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          queue_item_id: queueItemId,
        }),
      });
      refetchQueue();
    } catch (error) {
      console.error('Failed to remove from queue:', error);
    }
  };

  const reorderQueue = async (fromIndex: number, toIndex: number) => {
    try {
      const response = await fetch('/api/music/queue/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from_index: fromIndex,
          to_index: toIndex,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.warn('Reorder not supported:', error.error);
        // Don't refetch since reorder didn't work
        return;
      }

      refetchQueue();
    } catch (error) {
      console.error('Failed to reorder queue:', error);
    }
  };

  const controlMedia = async (action: MediaControlAction) => {
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

  const setVolume = async (volume: number) => {
    try {
      await fetch('/api/music/volume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ volume }),
      });
      refetchStatus();
    } catch (error) {
      console.error('Failed to set volume:', error);
    }
  };

  const seekTo = async (position: number) => {
    try {
      await fetch('/api/music/seek', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ position }),
      });
      refetchStatus();
    } catch (error) {
      console.error('Failed to seek:', error);
    }
  };

  const handleViewChange = (newView: ViewType) => {
    setView(newView);
    setSelectedArtistId(null);
    setSelectedPlaylistId(null);
  };

  const handleToggleSection = (section: 'artists' | 'albums' | 'tracks') => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-lg shadow-lg">
      <NowPlayingBar
        nowPlaying={nowPlaying!}
        onControlMedia={controlMedia}
        onSetVolume={setVolume}
        onSeek={seekTo}
      />

      <NavigationTabs
        currentView={view}
        onViewChange={handleViewChange}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <div className="flex-1 overflow-y-auto p-4">
        {view === 'artists' && !selectedArtistId && (
          <ArtistList
            artists={artists || []}
            loading={artistsLoading}
            onSelectArtist={setSelectedArtistId}
          />
        )}

        {view === 'artists' && selectedArtistId && (
          <ArtistDetail
            tracks={artistTracks || []}
            loading={artistTracksLoading}
            onBack={() => setSelectedArtistId(null)}
          />
        )}

        {view === 'playlists' && !selectedPlaylistId && (
          <PlaylistList
            playlists={playlists || []}
            loading={playlistsLoading}
            onSelectPlaylist={setSelectedPlaylistId}
          />
        )}

        {view === 'playlists' && selectedPlaylistId && (
          <PlaylistDetail
            tracks={playlistTracks || []}
            loading={playlistTracksLoading}
            onBack={() => setSelectedPlaylistId(null)}
          />
        )}

        {view === 'search' && (
          <SearchView
            searchResults={searchResults}
            debouncedSearch={debouncedSearch}
            loading={searchLoading}
            expandedSections={expandedSections}
            onToggleSection={handleToggleSection}
            onSelectArtist={(id) => {
              setSelectedArtistId(id);
              setView('artists');
            }}
            onSelectAlbum={setSelectedAlbumId}
          />
        )}

        {view === 'queue' && (
          <QueueList queue={queue} onRemove={removeFromQueue} onReorder={reorderQueue} />
        )}
      </div>

      <AlbumTracksModal
        tracks={albumTracks}
        loading={albumTracksLoading}
        isOpen={!!selectedAlbumId}
        onClose={() => setSelectedAlbumId(null)}
      />
    </div>
  );
}
