import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(request: Request) {
  const shieldIp = process.env.SHIELD_IP;

  if (!shieldIp) {
    return NextResponse.json({ error: 'SHIELD_IP not configured' }, { status: 500 });
  }

  const { text } = await request.json();

  try {
    // Escape text for shell - replace spaces with %s and special chars
    const escapedText = text.replace(/ /g, '%s').replace(/'/g, "\\'");
    await execAsync(
      `adb connect ${shieldIp}:5555 > /dev/null 2>&1 && adb shell "input text '${escapedText}'"`
    );

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Text input error:', e);
    return NextResponse.json({ error: 'Failed to send text' }, { status: 500 });
  }
}
