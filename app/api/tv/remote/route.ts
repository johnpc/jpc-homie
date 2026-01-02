import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(request: Request) {
  const shieldIp = process.env.SHIELD_IP;

  if (!shieldIp) {
    return NextResponse.json({ error: 'SHIELD_IP not configured' }, { status: 500 });
  }

  const { button } = await request.json();

  try {
    let keycode = '';

    switch (button) {
      case 'Back':
        keycode = 'KEYCODE_BACK';
        break;
      case 'Home':
        keycode = 'KEYCODE_HOME';
        break;
      case 'Up':
        keycode = 'KEYCODE_DPAD_UP';
        break;
      case 'Down':
        keycode = 'KEYCODE_DPAD_DOWN';
        break;
      case 'Left':
        keycode = 'KEYCODE_DPAD_LEFT';
        break;
      case 'Right':
        keycode = 'KEYCODE_DPAD_RIGHT';
        break;
      case 'Select':
        keycode = 'KEYCODE_DPAD_CENTER';
        break;
      default:
        return NextResponse.json({ error: 'Unknown button' }, { status: 400 });
    }

    await execAsync(
      `adb connect ${shieldIp}:5555 > /dev/null 2>&1 && adb shell "input keyevent ${keycode}"`
    );

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Remote button error:', e);
    return NextResponse.json({ error: 'Failed to send button' }, { status: 500 });
  }
}
