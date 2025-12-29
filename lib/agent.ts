import { Agent, tool } from '@strands-agents/sdk';
import { z } from 'zod';

const SYSTEM_PROMPT = `You are a smart home assistant that controls devices through Home Assistant.

Your capabilities:
- Control lights (turn on/off, adjust brightness)
- Control switches and other devices
- Check sensor states (temperature, humidity, etc)
- Adjust thermostats and climate devices
- Activate scenes (PREFERRED for multi-device control)
- Control media players (play music, adjust volume, pause/play/stop)
- Play music via Music Assistant (artists, albums, tracks, playlists)
- Control door locks (lock/unlock)
- Query device states and discover available devices

When users ask you to control devices:
1. PREFER SCENES when available - they're faster and more efficient than controlling individual devices
2. For music requests: First use search_jellyfin to verify the track exists and get the exact name, then use play_music with a SHORT, SIMPLE search term (just the song title or artist name). Use media_player.living_room_sonos as the entity_id.
3. For lock requests: Use get_all_states to find lock entities, then use control_lock to lock/unlock them
4. Take immediate action when the intent is clear - don't ask for clarification unless absolutely necessary
5. If multiple scene options exist (e.g., "bedroom bright" and "main floor bright"), activate the bedroom scene as it's most commonly used
6. For volume changes: check current volume first, then use volume_set to make noticeable changes (increase/decrease by 0.2 or more)
7. After taking action, briefly confirm what you did
8. Only ask for clarification if the request is truly ambiguous or impossible to fulfill

Be proactive and action-oriented. Users prefer quick execution over lengthy explanations.`;

class HomeAssistantClient {
  public config: { url: string; token: string; jellyfinUrl?: string; jellyfinApiKey?: string };

  constructor(config: {
    url: string;
    token: string;
    jellyfinUrl?: string;
    jellyfinApiKey?: string;
  }) {
    this.config = config;
  }

  async callService(
    domain: string,
    service: string,
    data: { entity_id?: string; [key: string]: unknown },
    returnResponse = false
  ) {
    const url = `${this.config.url}/api/services/${domain}/${service}${returnResponse ? '?return_response=true' : ''}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.config.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`HA API error: ${response.statusText}`);
    return response.json();
  }

  async getStates() {
    const response = await fetch(`${this.config.url}/api/states`, {
      headers: { Authorization: `Bearer ${this.config.token}` },
    });
    if (!response.ok) throw new Error(`HA API error: ${response.statusText}`);
    return response.json();
  }

  async getState(entityId: string) {
    const response = await fetch(`${this.config.url}/api/states/${entityId}`, {
      headers: { Authorization: `Bearer ${this.config.token}` },
    });
    if (!response.ok) throw new Error(`HA API error: ${response.statusText}`);
    return response.json();
  }
}

function createTools(haClient: HomeAssistantClient) {
  return [
    tool({
      name: 'get_entity_state',
      description:
        'Get the current state of a Home Assistant entity (light, switch, sensor, etc). Returns the state and attributes.',
      inputSchema: z.object({
        entity_id: z
          .string()
          .describe('The entity ID (e.g., light.living_room, sensor.temperature)'),
      }),
      callback: async ({ entity_id }: { entity_id: string }) => {
        return JSON.stringify(await haClient.getState(entity_id));
      },
    }),
    tool({
      name: 'get_all_states',
      description: 'Get the current state of all devices in Home Assistant',
      inputSchema: z.object({}),
      callback: async () => {
        return JSON.stringify(await haClient.getStates());
      },
    }),
    tool({
      name: 'turn_on_device',
      description: 'Turn on a device (light, switch, etc)',
      inputSchema: z.object({
        entity_id: z.string().describe('The entity ID (e.g., light.living_room)'),
      }),
      callback: async ({ entity_id }: { entity_id: string }) => {
        const [domain] = entity_id.split('.');
        return JSON.stringify(await haClient.callService(domain, 'turn_on', { entity_id }));
      },
    }),
    tool({
      name: 'turn_off_device',
      description: 'Turn off a device (light, switch, etc)',
      inputSchema: z.object({
        entity_id: z.string().describe('The entity ID (e.g., light.living_room)'),
      }),
      callback: async ({ entity_id }: { entity_id: string }) => {
        const [domain] = entity_id.split('.');
        return JSON.stringify(await haClient.callService(domain, 'turn_off', { entity_id }));
      },
    }),
    tool({
      name: 'set_light_brightness',
      description: 'Set the brightness of a light (0-255)',
      inputSchema: z.object({
        entity_id: z.string().describe('The light entity ID (e.g., light.living_room)'),
        brightness: z.number().min(0).max(255).describe('Brightness level (0-255)'),
      }),
      callback: async ({ entity_id, brightness }: { entity_id: string; brightness: number }) => {
        return JSON.stringify(
          await haClient.callService('light', 'turn_on', { entity_id, brightness })
        );
      },
    }),
    tool({
      name: 'set_climate_temperature',
      description: 'Set the target temperature for a thermostat or climate device',
      inputSchema: z.object({
        entity_id: z.string().describe('The climate entity ID (e.g., climate.living_room)'),
        temperature: z.number().describe('Target temperature'),
      }),
      callback: async ({ entity_id, temperature }: { entity_id: string; temperature: number }) => {
        return JSON.stringify(
          await haClient.callService('climate', 'set_temperature', { entity_id, temperature })
        );
      },
    }),
    tool({
      name: 'activate_scene',
      description:
        'Activate a scene in Home Assistant. Scenes are pre-configured settings for multiple devices.',
      inputSchema: z.object({
        entity_id: z.string().describe('The scene entity ID (e.g., scene.bedroom_red)'),
      }),
      callback: async ({ entity_id }: { entity_id: string }) => {
        return JSON.stringify(await haClient.callService('scene', 'turn_on', { entity_id }));
      },
    }),
    tool({
      name: 'control_media_player',
      description: 'Control media player playback (play, pause, stop, next, previous, volume)',
      inputSchema: z.object({
        entity_id: z.string().describe('The media player entity ID'),
        action: z
          .enum([
            'play',
            'pause',
            'stop',
            'next_track',
            'previous_track',
            'volume_up',
            'volume_down',
            'volume_set',
          ])
          .describe('The action to perform'),
        volume_level: z
          .number()
          .min(0)
          .max(1)
          .optional()
          .describe('Volume level (0.0-1.0) for volume_set action'),
      }),
      callback: async ({
        entity_id,
        action,
        volume_level,
      }: {
        entity_id: string;
        action: string;
        volume_level?: number;
      }) => {
        const serviceMap: Record<string, string> = {
          play: 'media_play',
          pause: 'media_pause',
          stop: 'media_stop',
          next_track: 'media_next_track',
          previous_track: 'media_previous_track',
          volume_up: 'volume_up',
          volume_down: 'volume_down',
          volume_set: 'volume_set',
        };
        const service = serviceMap[action];
        const data: { entity_id: string; volume_level?: number } = { entity_id };
        if (action === 'volume_set' && volume_level !== undefined) {
          data.volume_level = volume_level;
        }
        return JSON.stringify(await haClient.callService('media_player', service, data));
      },
    }),
    tool({
      name: 'search_jellyfin',
      description:
        'Search Jellyfin library for tracks, artists, or albums. Returns detailed results including track lists for artists.',
      inputSchema: z.object({
        query: z.string().describe('Search query'),
        type: z.enum(['track', 'artist', 'album']).describe('Type to search for'),
      }),
      callback: async ({ query, type }: { query: string; type: string }) => {
        if (!haClient.config.jellyfinUrl || !haClient.config.jellyfinApiKey) {
          return JSON.stringify({ error: 'Jellyfin not configured' });
        }

        if (type === 'artist') {
          // First find the artist
          const artistResponse = await fetch(
            `${haClient.config.jellyfinUrl}/Artists?searchTerm=${encodeURIComponent(query)}`,
            { headers: { 'X-Emby-Token': haClient.config.jellyfinApiKey } }
          );
          const artistData = await artistResponse.json();
          const artist = artistData.Items?.find((i: { Name: string }) =>
            i.Name.toLowerCase().includes(query.toLowerCase())
          );

          if (!artist) {
            return JSON.stringify({ found: false, message: 'Artist not found' });
          }

          // Get tracks by this artist
          const tracksResponse = await fetch(
            `${haClient.config.jellyfinUrl}/Items?ArtistIds=${artist.Id}&IncludeItemTypes=Audio&Recursive=true`,
            { headers: { 'X-Emby-Token': haClient.config.jellyfinApiKey } }
          );
          const tracksData = await tracksResponse.json();

          return JSON.stringify({
            found: true,
            artist: artist.Name,
            trackCount: tracksData.TotalRecordCount || 0,
            tracks:
              tracksData.Items?.slice(0, 20).map((i: { Name: string; Album?: string }) => ({
                name: i.Name,
                album: i.Album,
              })) || [],
          });
        }

        // For tracks and albums, use simple search
        const itemType =
          type === 'track' ? 'Audio' : type === 'artist' ? 'MusicArtist' : 'MusicAlbum';
        const response = await fetch(
          `${haClient.config.jellyfinUrl}/Items?searchTerm=${encodeURIComponent(query)}&IncludeItemTypes=${itemType}&Recursive=true&Limit=20`,
          { headers: { 'X-Emby-Token': haClient.config.jellyfinApiKey } }
        );
        const data = await response.json();

        return JSON.stringify({
          found: (data.Items?.length || 0) > 0,
          count: data.TotalRecordCount || 0,
          results:
            data.Items?.map((i: { Name: string; Artists?: string[]; Album?: string }) => ({
              name: i.Name,
              artist: i.Artists?.[0],
              album: i.Album,
            })) || [],
        });
      },
    }),
    tool({
      name: 'enhanced_music_search',
      description:
        'Advanced music search features: find similar music, search by genre/mood, or view recently played tracks.',
      inputSchema: z.object({
        action: z
          .enum(['similar', 'genre', 'recently_played'])
          .describe('Type of search to perform'),
        query: z
          .string()
          .optional()
          .describe('Genre/mood to search for (required for genre action)'),
        entity_id: z
          .string()
          .optional()
          .describe('Media player entity ID (required for similar and recently_played actions)'),
      }),
      callback: async ({
        action,
        query,
        entity_id,
      }: {
        action: string;
        query?: string;
        entity_id?: string;
      }) => {
        if (!haClient.config.jellyfinUrl || !haClient.config.jellyfinApiKey) {
          return JSON.stringify({ error: 'Jellyfin not configured' });
        }

        if (action === 'similar') {
          if (!entity_id) {
            return JSON.stringify({ error: 'entity_id required for similar action' });
          }
          // Get current playing track
          const state = await haClient.getState(entity_id);
          const currentArtist = state.attributes?.media_artist;
          const currentGenre = state.attributes?.media_genre;

          if (!currentArtist) {
            return JSON.stringify({ error: 'No track currently playing' });
          }

          // Search for tracks by same artist or genre
          const response = await fetch(
            `${haClient.config.jellyfinUrl}/Items?Artists=${encodeURIComponent(currentArtist)}&IncludeItemTypes=Audio&Recursive=true&Limit=20`,
            { headers: { 'X-Emby-Token': haClient.config.jellyfinApiKey } }
          );
          const data = await response.json();

          return JSON.stringify({
            current_track: state.attributes?.media_title,
            current_artist: currentArtist,
            similar_tracks:
              data.Items?.slice(0, 10).map((i: { Name: string; Album?: string }) => ({
                name: i.Name,
                album: i.Album,
              })) || [],
          });
        } else if (action === 'genre') {
          if (!query) {
            return JSON.stringify({ error: 'query required for genre action' });
          }

          // Search by genre in track names or artist names
          const response = await fetch(
            `${haClient.config.jellyfinUrl}/Items?searchTerm=${encodeURIComponent(query)}&IncludeItemTypes=Audio&Recursive=true&Limit=30`,
            { headers: { 'X-Emby-Token': haClient.config.jellyfinApiKey } }
          );
          const data = await response.json();

          return JSON.stringify({
            genre: query,
            found: (data.Items?.length || 0) > 0,
            tracks:
              data.Items?.slice(0, 15).map(
                (i: { Name: string; Artists?: string[]; Album?: string }) => ({
                  name: i.Name,
                  artist: i.Artists?.[0],
                  album: i.Album,
                })
              ) || [],
          });
        } else if (action === 'recently_played') {
          if (!entity_id) {
            return JSON.stringify({ error: 'entity_id required for recently_played action' });
          }

          // Get recently played from Jellyfin
          const response = await fetch(
            `${haClient.config.jellyfinUrl}/Users/2fee110568a441a1b148020b5843d5c9/Items?SortBy=DatePlayed&SortOrder=Descending&IncludeItemTypes=Audio&Limit=20&Recursive=true&Filters=IsPlayed`,
            { headers: { 'X-Emby-Token': haClient.config.jellyfinApiKey } }
          );
          const data = await response.json();

          return JSON.stringify({
            recently_played:
              data.Items?.map(
                (i: {
                  Name: string;
                  Artists?: string[];
                  Album?: string;
                  UserData?: { LastPlayedDate?: string };
                }) => ({
                  name: i.Name,
                  artist: i.Artists?.[0],
                  album: i.Album,
                  last_played: i.UserData?.LastPlayedDate,
                })
              ) || [],
          });
        }

        return JSON.stringify({ error: 'Invalid action' });
      },
    }),
    tool({
      name: 'manage_queue',
      description:
        'View and manage the music playback queue. Can view, add songs, clear queue, or skip tracks.',
      inputSchema: z.object({
        entity_id: z
          .string()
          .describe('The media player entity ID (e.g., media_player.living_room_sonos)'),
        action: z
          .enum(['view', 'add', 'clear', 'skip_next', 'skip_previous'])
          .describe('Action to perform on the queue'),
        media_content_id: z
          .string()
          .optional()
          .describe('Song/artist/album to add (required for add action)'),
        media_content_type: z
          .enum(['artist', 'album', 'track', 'playlist'])
          .optional()
          .describe('Type of media to add (required for add action)'),
      }),
      callback: async ({
        entity_id,
        action,
        media_content_id,
        media_content_type,
      }: {
        entity_id: string;
        action: string;
        media_content_id?: string;
        media_content_type?: string;
      }) => {
        if (action === 'view') {
          const state = await haClient.getState(entity_id);
          const queue = state.attributes?.queue_position || 0;
          const queueSize = state.attributes?.queue_size || 0;
          const currentTrack = state.attributes?.media_title || 'Unknown';
          const currentArtist = state.attributes?.media_artist || 'Unknown';

          return JSON.stringify({
            current_position: queue,
            queue_size: queueSize,
            current_track: `${currentTrack} by ${currentArtist}`,
            message: `Playing track ${queue + 1} of ${queueSize}`,
          });
        } else if (action === 'add') {
          if (!media_content_id || !media_content_type) {
            return JSON.stringify({
              error: 'media_content_id and media_content_type required for add action',
            });
          }
          await haClient.callService('media_player', 'play_media', {
            entity_id,
            media_content_id,
            media_content_type,
            enqueue: 'add',
          });
          return JSON.stringify({ message: `Added ${media_content_id} to queue` });
        } else if (action === 'clear') {
          await haClient.callService('media_player', 'clear_playlist', { entity_id });
          return JSON.stringify({ message: 'Queue cleared' });
        } else if (action === 'skip_next') {
          await haClient.callService('media_player', 'media_next_track', { entity_id });
          await new Promise((resolve) => setTimeout(resolve, 1000));
          const state = await haClient.getState(entity_id);
          const title = state.attributes?.media_title || 'Unknown';
          const artist = state.attributes?.media_artist || 'Unknown';
          return JSON.stringify({ message: `Skipped to: ${title} by ${artist}` });
        } else if (action === 'skip_previous') {
          await haClient.callService('media_player', 'media_previous_track', { entity_id });
          await new Promise((resolve) => setTimeout(resolve, 1000));
          const state = await haClient.getState(entity_id);
          const title = state.attributes?.media_title || 'Unknown';
          const artist = state.attributes?.media_artist || 'Unknown';
          return JSON.stringify({ message: `Went back to: ${title} by ${artist}` });
        }
        return JSON.stringify({ error: 'Invalid action' });
      },
    }),
    tool({
      name: 'play_music',
      description:
        'Play music via Music Assistant. Use simple, short search terms for best results.',
      inputSchema: z.object({
        entity_id: z
          .string()
          .describe('The media player entity ID (e.g., media_player.living_room_sonos)'),
        media_content_id: z
          .string()
          .describe('Short search term (e.g., "sweet", "queen") - keep it simple'),
        media_content_type: z
          .enum(['artist', 'album', 'track', 'playlist'])
          .describe('Type of media to play'),
      }),
      callback: async ({
        entity_id,
        media_content_id,
        media_content_type,
      }: {
        entity_id: string;
        media_content_id: string;
        media_content_type: string;
      }) => {
        await haClient.callService('media_player', 'play_media', {
          entity_id,
          media_content_id,
          media_content_type,
        });

        await new Promise((resolve) => setTimeout(resolve, 2000));
        const state = await haClient.getState(entity_id);

        const title = (state.attributes?.media_title as string) || 'Unknown';
        const artist = (state.attributes?.media_artist as string) || 'Unknown';
        const album = (state.attributes?.media_album_name as string) || '';

        return `Started playing. Current track: "${title}" by ${artist}${album ? ` (${album})` : ''}`;
      },
    }),
    tool({
      name: 'control_lock',
      description: 'Lock or unlock a door lock',
      inputSchema: z.object({
        entity_id: z.string().describe('The lock entity ID (e.g., lock.front_door)'),
        action: z.enum(['lock', 'unlock']).describe('Action to perform'),
      }),
      callback: async ({ entity_id, action }: { entity_id: string; action: string }) => {
        return JSON.stringify(await haClient.callService('lock', action, { entity_id }));
      },
    }),
  ];
}

export function createAgent(
  haUrl: string,
  haToken: string,
  jellyfinUrl?: string,
  jellyfinApiKey?: string
) {
  const haClient = new HomeAssistantClient({
    url: haUrl,
    token: haToken,
    jellyfinUrl,
    jellyfinApiKey,
  });
  const tools = createTools(haClient);

  return new Agent({
    systemPrompt: SYSTEM_PROMPT,
    tools: tools,
  });
}

export { HomeAssistantClient, createTools };
