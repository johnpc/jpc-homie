'use client';

import { JellyfinTrack } from '@/lib/jellyfin';

interface AlbumTracksModalProps {
  tracks: JellyfinTrack[] | undefined;
  loading: boolean;
  isOpen: boolean;
  onClose: () => void;
}

export default function AlbumTracksModal({
  tracks,
  loading,
  isOpen,
  onClose,
}: AlbumTracksModalProps) {
  if (!isOpen) return null;

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
      onClose();
    } catch (error) {
      console.error('Failed to play track:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="font-semibold text-lg">Album Tracks</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
            ×
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {loading && (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          )}
          {!loading && (
            <div className="space-y-2">
              {tracks?.map((track, idx) => (
                <button
                  key={`${track.Id}-${idx}`}
                  onClick={() => playTrack(track)}
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
  );
}
