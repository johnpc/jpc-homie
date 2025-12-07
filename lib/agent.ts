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
- Search and play music via Music Assistant (REQUIRED: search first, then play with URI)
- Control door locks (lock/unlock)
- Query device states and discover available devices

When users ask you to control devices:
1. PREFER SCENES when available - they're faster and more efficient than controlling individual devices
2. For music requests: ALWAYS use this workflow:
   a. Use search_music_assistant to find the artist/album/track
   b. Extract the "uri" field from the search results
   c. Use play_music_assistant with that uri
   d. Include the exact "Current track" information from the play_music_assistant tool response
3. For lock requests: Use get_all_states to find lock entities, then use control_lock to lock/unlock them
4. Take immediate action when the intent is clear - don't ask for clarification unless absolutely necessary
5. If multiple scene options exist (e.g., "bedroom bright" and "main floor bright"), activate the bedroom scene as it's most commonly used
6. For music requests, use the Sonos media player (media_player.living_room_sonos)
7. For volume changes: check current volume first, then use volume_set to make noticeable changes (increase/decrease by 0.2 or more)
8. After taking action, briefly confirm what you did
9. Only ask for clarification if the request is truly ambiguous or impossible to fulfill

Be proactive and action-oriented. Users prefer quick execution over lengthy explanations.`;

class HomeAssistantClient {
  constructor(private config: { url: string; token: string }) {}

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
      name: 'search_music_assistant',
      description:
        'Search Music Assistant for artists, albums, tracks, or playlists. Returns results with URIs to play.',
      inputSchema: z.object({
        search_name: z.string().describe('What to search for (e.g., "Queen", "Bohemian Rhapsody")'),
        media_type: z
          .enum(['artist', 'album', 'track', 'playlist'])
          .optional()
          .describe('Type of media to search for'),
      }),
      callback: async ({
        search_name,
        media_type,
      }: {
        search_name: string;
        media_type?: string;
      }) => {
        const data: Record<string, unknown> = {
          config_entry_id: '01JFXB6AN0J9RS77J8523HVWCB',
          name: search_name,
          limit: 5,
        };
        if (media_type) data.media_type = [media_type];
        return JSON.stringify(await haClient.callService('music_assistant', 'search', data, true));
      },
    }),
    tool({
      name: 'play_music_assistant',
      description: 'Play music from Music Assistant using a URI from search results.',
      inputSchema: z.object({
        entity_id: z
          .string()
          .describe('The media player entity ID (e.g., media_player.living_room_sonos)'),
        uri: z.string().describe('The URI from search results (e.g., library://artist/698)'),
        media_type: z
          .enum(['artist', 'album', 'track', 'playlist', 'radio'])
          .describe('Type of media'),
      }),
      callback: async ({
        entity_id,
        uri,
        media_type,
      }: {
        entity_id: string;
        uri: string;
        media_type: string;
      }) => {
        await haClient.callService('music_assistant', 'play_media', {
          entity_id,
          media_id: uri,
          media_type,
        });

        await new Promise((resolve) => setTimeout(resolve, 2000));
        const state = await haClient.getState(entity_id);

        const title = (state.attributes?.media_title as string) || 'Unknown';
        const artist = (state.attributes?.media_artist as string) || 'Unknown';
        const album = (state.attributes?.media_album_name as string) || '';

        return `Started playing ${media_type}. Current track: "${title}" by ${artist}${album ? ` (${album})` : ''}`;
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

export function createAgent(haUrl: string, haToken: string) {
  const haClient = new HomeAssistantClient({ url: haUrl, token: haToken });
  const tools = createTools(haClient);

  return new Agent({
    systemPrompt: SYSTEM_PROMPT,
    tools: tools,
  });
}

export { HomeAssistantClient, createTools };
