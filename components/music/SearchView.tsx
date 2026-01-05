'use client';

import { SearchResults, JellyfinTrack } from '@/lib/jellyfin';
import BrowseMusicItemCard from './BrowseMusicItemCard';

interface SearchViewProps {
  searchResults: SearchResults | undefined;
  debouncedSearch: string;
  loading: boolean;
  expandedSections: {
    artists: boolean;
    albums: boolean;
    tracks: boolean;
  };
  onToggleSection: (section: 'artists' | 'albums' | 'tracks') => void;
  onSelectArtist: (artistId: string) => void;
  onSelectAlbum: (albumId: string) => void;
}

export default function SearchView({
  searchResults,
  debouncedSearch,
  loading,
  expandedSections,
  onToggleSection,
  onSelectArtist,
  onSelectAlbum,
}: SearchViewProps) {
  if (debouncedSearch.length <= 2) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!searchResults) {
    return null;
  }

  if (
    searchResults.artists.length === 0 &&
    searchResults.albums.length === 0 &&
    searchResults.tracks.length === 0
  ) {
    return (
      <div className="text-center text-gray-500 py-8">No results found for "{debouncedSearch}"</div>
    );
  }

  return (
    <div className="space-y-4">
      {searchResults.artists.length > 0 && (
        <div className="border rounded-lg overflow-hidden">
          <button
            onClick={() => onToggleSection('artists')}
            className="w-full p-3 bg-blue-100 hover:bg-blue-200 text-left font-semibold flex justify-between items-center text-gray-900"
          >
            <span>🎤 Artists ({searchResults.artists.length})</span>
            <span>{expandedSections.artists ? '▼' : '▶'}</span>
          </button>
          {expandedSections.artists && (
            <div className="p-2 space-y-2">
              {searchResults.artists.map((artist) => {
                const imageUrl = artist.ImageTags?.Primary
                  ? `${process.env.NEXT_PUBLIC_JELLYFIN_URL}/Items/${artist.Id}/Images/Primary?maxHeight=100&quality=90`
                  : null;

                return (
                  <button
                    key={artist.Id}
                    onClick={() => onSelectArtist(artist.Id)}
                    className="w-full p-3 bg-blue-50 hover:bg-blue-100 rounded-lg text-left transition flex items-center gap-3"
                  >
                    {imageUrl && (
                      <img
                        src={imageUrl}
                        alt={artist.Name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    )}
                    <div className="font-medium text-gray-900">{artist.Name}</div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {searchResults.albums.length > 0 && (
        <div className="border rounded-lg overflow-hidden">
          <button
            onClick={() => onToggleSection('albums')}
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
                  onClick={() => onSelectAlbum(album.Id)}
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

      {searchResults.tracks.length > 0 && (
        <div className="border rounded-lg overflow-hidden">
          <button
            onClick={() => onToggleSection('tracks')}
            className="w-full p-3 bg-green-100 hover:bg-green-200 text-left font-semibold flex justify-between items-center text-gray-900"
          >
            <span>🎵 Tracks ({searchResults.tracks.length})</span>
            <span>{expandedSections.tracks ? '▼' : '▶'}</span>
          </button>
          {expandedSections.tracks && (
            <div className="p-2 space-y-2">
              {searchResults.tracks.map((track, idx) => (
                <BrowseMusicItemCard key={`${track.Id}-${idx}`} track={track} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
