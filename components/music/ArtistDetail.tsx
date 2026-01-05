'use client';

import { JellyfinTrack } from '@/lib/jellyfin';
import BrowseMusicItemCard from './BrowseMusicItemCard';

interface ArtistDetailProps {
  tracks: JellyfinTrack[];
  loading: boolean;
  onBack: () => void;
}

export default function ArtistDetail({ tracks, loading, onBack }: ArtistDetailProps) {
  return (
    <div>
      <button onClick={onBack} className="mb-4 text-blue-600 hover:text-blue-800 font-medium">
        ← Back to Artists
      </button>
      {loading && (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
      {!loading && (
        <div className="space-y-2">
          {tracks?.map((track, idx) => (
            <BrowseMusicItemCard key={`${track.Id}-${idx}`} track={track} />
          ))}
        </div>
      )}
    </div>
  );
}
