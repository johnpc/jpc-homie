'use client';

interface Artist {
  Id: string;
  Name: string;
}

interface ArtistListProps {
  artists: Artist[];
  loading: boolean;
  onSelectArtist: (artistId: string) => void;
}

export default function ArtistList({ artists, loading, onSelectArtist }: ArtistListProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {artists?.map((artist) => (
        <button
          key={artist.Id}
          onClick={() => onSelectArtist(artist.Id)}
          className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 rounded-lg text-left transition shadow-sm hover:shadow-md border border-blue-200"
        >
          <div className="font-semibold text-gray-900">{artist.Name}</div>
        </button>
      ))}
    </div>
  );
}
