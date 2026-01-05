'use client';

import { NowPlaying, MediaControlAction } from './types';
import { formatTime } from './utils';
import { useState, useEffect } from 'react';

interface NowPlayingBarProps {
  nowPlaying: NowPlaying;
  onControlMedia: (action: MediaControlAction) => void;
  onSetVolume: (volume: number) => void;
  onSeek: (position: number) => void;
}

export default function NowPlayingBar({
  nowPlaying,
  onControlMedia,
  onSetVolume,
  onSeek,
}: NowPlayingBarProps) {
  const [localPosition, setLocalPosition] = useState(0);

  useEffect(() => {
    if (nowPlaying?.position !== undefined) {
      setLocalPosition(nowPlaying.position);
    }
  }, [nowPlaying?.position]);

  useEffect(() => {
    if (nowPlaying?.state === 'playing') {
      const interval = setInterval(() => {
        setLocalPosition((prev) => {
          const next = prev + 1;
          return nowPlaying.duration && next > nowPlaying.duration ? prev : next;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [nowPlaying?.state, nowPlaying?.duration]);

  if (!nowPlaying?.title) return null;

  return (
    <div className="p-4 bg-gradient-to-r from-green-500 to-teal-600 text-white border-b">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-sm">🔊</span>
        <input
          type="range"
          min="0"
          max="100"
          value={Math.round((nowPlaying.volume || 0) * 100)}
          onChange={(e) => onSetVolume(parseInt(e.target.value) / 100)}
          className="flex-1 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
          title="Volume"
        />
        <span className="text-sm w-10 text-right">
          {Math.round((nowPlaying.volume || 0) * 100)}%
        </span>
      </div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="font-semibold truncate">{nowPlaying.title}</div>
          <div className="text-sm opacity-90 truncate">
            {nowPlaying.artist} {nowPlaying.album && `• ${nowPlaying.album}`}
          </div>
        </div>
        <div className="flex gap-2 ml-4">
          <button
            onClick={() => onControlMedia('media_previous_track')}
            className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition"
            title="Previous"
          >
            ⏮️
          </button>
          <button
            onClick={() => onControlMedia('media_play_pause')}
            className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition"
            title={nowPlaying.state === 'playing' ? 'Pause' : 'Play'}
          >
            {nowPlaying.state === 'playing' ? '⏸️' : '▶️'}
          </button>
          <button
            onClick={() => onControlMedia('media_next_track')}
            className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition"
            title="Next"
          >
            ⏭️
          </button>
          <button
            onClick={() => onControlMedia('media_stop')}
            className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition"
            title="Stop"
          >
            ⏹️
          </button>
        </div>
      </div>
      {nowPlaying.duration && (
        <div className="flex items-center gap-3">
          <span className="text-xs w-10 text-right">{formatTime(localPosition)}</span>
          <div className="flex-1 relative">
            <div className="h-1 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-200"
                style={{ width: `${(localPosition / nowPlaying.duration) * 100}%` }}
              />
            </div>
            <input
              type="range"
              min="0"
              max={nowPlaying.duration}
              value={localPosition}
              onChange={(e) => {
                const newPos = parseInt(e.target.value);
                setLocalPosition(newPos);
                onSeek(newPos);
              }}
              className="absolute inset-0 w-full opacity-0 cursor-pointer"
              title="Seek"
            />
          </div>
          <span className="text-xs w-10">{formatTime(nowPlaying.duration)}</span>
        </div>
      )}
    </div>
  );
}
