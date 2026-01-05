'use client';

import { Queue } from './types';
import QueueMusicItemCard from './QueueMusicItemCard';
import { useState, useEffect, useRef } from 'react';

interface QueueListProps {
  queue: Queue | undefined;
  onRemove: (queueItemId: string) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
}

export default function QueueList({ queue, onRemove, onReorder }: QueueListProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const currentTrackRef = useRef<HTMLDivElement>(null);

  const currentPosition = queue?.position ?? 0;

  useEffect(() => {
    if (currentTrackRef.current) {
      currentTrackRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [queue?.position]);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    // Don't allow dragging items at or before current position
    if (index <= currentPosition) {
      e.preventDefault();
      return;
    }
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedIndex !== null && draggedIndex !== toIndex) {
      onReorder(draggedIndex, toIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

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
            <div
              key={item.queue_item_id}
              ref={idx === queue.position ? currentTrackRef : null}
              className={
                dragOverIndex === idx && draggedIndex !== idx
                  ? 'border-2 border-blue-400 rounded-lg'
                  : ''
              }
            >
              <QueueMusicItemCard
                item={item}
                isCurrentTrack={idx === queue.position}
                onRemove={onRemove}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                index={idx}
                isDraggable={idx > currentPosition}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
