import { NextResponse } from 'next/server';
import { getShieldEntityId } from '@/lib/shield';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET() {
  const haUrl = process.env.HOME_ASSISTANT_URL;
  const haToken = process.env.HOME_ASSISTANT_TOKEN;
  const shieldIp = process.env.SHIELD_IP;

  if (!haUrl || !haToken || !shieldIp) {
    return NextResponse.json({ error: 'Missing configuration' }, { status: 500 });
  }

  const entityId = await getShieldEntityId();
  if (!entityId) {
    return NextResponse.json({ error: 'Shield not found' }, { status: 404 });
  }

  // Get Shield state
  const stateResponse = await fetch(`${haUrl}/api/states/${entityId}`, {
    headers: { Authorization: `Bearer ${haToken}` },
  });

  if (!stateResponse.ok) {
    return NextResponse.json({ error: 'Failed to fetch TV status' }, { status: 500 });
  }

  const state = await stateResponse.json();

  // Get current app from ADB
  try {
    const { stdout } = await execAsync(
      `adb connect ${shieldIp}:5555 > /dev/null 2>&1 && adb shell "dumpsys activity activities | grep mResumedActivity"`
    );
    const match = stdout.match(/ActivityRecord\{[^\s]+ u\d+ ([^\/]+)/);
    if (match) {
      const packageName = match[1];
      state.attributes = { ...state.attributes, app_name: packageName, app_id: packageName };
    }
  } catch (e) {
    console.error('ADB app fetch error:', e);
  }

  // Volume cannot be read from Roku TV or Shield (CEC passthrough)
  // Return current volume as 18/100 based on user report
  state.attributes = { ...state.attributes, volume_level: 0.18 };

  return NextResponse.json(state);
}
