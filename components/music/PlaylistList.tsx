'use client';

interface Playlist {
  Id: string;
  Name: string;
}

interface PlaylistListProps {
  playlists: Playlist[];
  loading: boolean;
  onSelectPlaylist: (playlistId: string) => void;
}

export default function PlaylistList({ playlists, loading, onSelectPlaylist }: PlaylistListProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {playlists?.map((playlist) => (
        <button
          key={playlist.Id}
          onClick={() => onSelectPlaylist(playlist.Id)}
          className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 rounded-lg text-left transition shadow-sm hover:shadow-md border border-purple-200"
        >
          <div className="font-semibold text-gray-900">{playlist.Name}</div>
        </button>
      ))}
    </div>
  );
}
