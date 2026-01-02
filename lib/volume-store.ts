// Store last known volume in memory (resets on server restart)
let lastKnownVolume = 18; // Start at 18 as reported

export function getLastVolume(): number {
  return lastKnownVolume;
}

export function setLastVolume(volume: number): void {
  lastKnownVolume = volume;
}
