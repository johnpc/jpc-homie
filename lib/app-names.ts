const APP_NAMES: Record<string, string> = {
  'ar.tvplayer.tv': 'TiviMate',
  'com.netflix.ninja': 'Netflix',
  'com.amazon.avod.thirdpartyclient': 'Prime Video',
  'com.disney.disneyplus': 'Disney+',
  'com.hbo.hbonow': 'HBO Max',
  'com.google.android.youtube.tv': 'YouTube',
  'com.plexapp.android': 'Plex',
  'com.spotify.tv.android': 'Spotify',
  'com.google.android.tvlauncher': 'Android TV Home',
  'com.nvidia.shield.remote.server': 'Shield Remote',
};

export function getFriendlyAppName(packageName: string): string {
  return APP_NAMES[packageName] || packageName;
}
