'use client';

import { Queue } from './types';
import QueueMusicItemCard from './QueueMusicItemCard';

interface QueueListProps {
  queue: Queue | undefined;
  onRemove: (queueItemId: string) => void;
}

export default function QueueList({ queue, onRemove }: QueueListProps) {
  if (!queue?.queue || queue.queue.length === 0) {
    return <div className="text-center text-gray-500 py-8">Queue is empty</div>;
  }

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4 text-gray-900">Current Queue</h3>
      <div className="space-y-4">
        {queue.total && (
          <div className="text-sm text-gray-600 mb-2">
            Total: {queue.total} items, Position: {queue.position + 1}
          </div>
        )}
        <div className="space-y-2">
          {queue.queue.map((item, idx) => (
            <QueueMusicItemCard
              key={item.queue_item_id}
              item={item}
              isCurrentTrack={idx === queue.position}
              onRemove={onRemove}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
