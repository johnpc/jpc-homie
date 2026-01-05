'use client';

import { QueueItem } from './types';

interface QueueMusicItemCardProps {
  item: QueueItem;
  isCurrentTrack: boolean;
  onRemove: (queueItemId: string) => void;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent, index: number) => void;
  index: number;
  isDraggable: boolean;
}

export default function QueueMusicItemCard({
  item,
  isCurrentTrack,
  onRemove,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  index,
  isDraggable,
}: QueueMusicItemCardProps) {
  return (
    <div
      draggable={isDraggable}
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, index)}
      className={`p-4 rounded-lg border ${
        isCurrentTrack ? 'bg-green-50 border-green-500 border-2' : 'bg-gray-50 border-gray-200'
      } ${isDraggable ? 'cursor-move' : 'opacity-50'}`}
    >
      <div className="flex items-start gap-3">
        {isDraggable && (
          <div className="text-gray-400 cursor-grab active:cursor-grabbing pt-1">⋮⋮</div>
        )}
        {item.media_item?.image && (
          <img
            src={item.media_item.image.path}
            alt={item.media_item.name}
            className="w-16 h-16 rounded object-cover"
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {isCurrentTrack && (
              <span className="inline-block px-2 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full">
                ▶ Now Playing
              </span>
            )}
          </div>
          <div className="font-medium text-gray-900 truncate">
            {item.media_item?.name || item.name}
          </div>
          {item.media_item?.artists?.[0] && (
            <div className="text-sm text-gray-600 truncate">{item.media_item.artists[0].name}</div>
          )}
          {item.media_item?.album && (
            <div className="text-sm text-gray-500 truncate">{item.media_item.album.name}</div>
          )}
          {item.duration && (
            <div className="text-xs text-gray-400 mt-1">
              {Math.floor(item.duration / 60)}:{(item.duration % 60).toString().padStart(2, '0')}
            </div>
          )}
        </div>
        {!isCurrentTrack && (
          <button
            onClick={() => onRemove(item.queue_item_id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
            title="Remove from queue"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
