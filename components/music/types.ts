export interface NowPlaying {
  state: string;
  title?: string;
  artist?: string;
  album?: string;
  volume?: number;
  position?: number;
  duration?: number;
}

export interface QueueItem {
  queue_item_id: string;
  name: string;
  duration?: number;
  media_item?: {
    name: string;
    image?: {
      path: string;
    };
    artists?: Array<{ name: string }>;
    album?: {
      name: string;
    };
  };
}

export interface Queue {
  queue: QueueItem[];
  position: number;
  total?: number;
}

export type ViewType = 'artists' | 'playlists' | 'search' | 'queue';

export type MediaControlAction =
  | 'media_play_pause'
  | 'media_stop'
  | 'media_next_track'
  | 'media_previous_track';
