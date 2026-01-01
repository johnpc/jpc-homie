export async function getShieldEntityId(): Promise<string | null> {
  const haUrl = process.env.HOME_ASSISTANT_URL;
  const haToken = process.env.HOME_ASSISTANT_TOKEN;

  if (!haUrl || !haToken) return null;

  const response = await fetch(`${haUrl}/api/states`, {
    headers: { Authorization: `Bearer ${haToken}` },
  });

  if (!response.ok) return null;

  const entities = await response.json();
  const shield = entities.find(
    (e: { entity_id: string; state: string }) =>
      e.entity_id.includes('shield') &&
      e.entity_id.startsWith('media_player.') &&
      e.state !== 'unavailable'
  );

  return shield?.entity_id || null;
}
