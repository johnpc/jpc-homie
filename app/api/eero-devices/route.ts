import { NextResponse } from 'next/server';
import * as eeroTs from '@343max/eero-ts';
import fetch from 'node-fetch';
import { readFile, writeFile } from 'fs/promises';

export async function GET() {
  const cookiePath = process.env.EERO_COOKIE_PATH;

  if (!cookiePath) {
    return NextResponse.json({ error: 'EERO_COOKIE_PATH not configured' }, { status: 500 });
  }

  try {
    const cookie = await readFile(cookiePath, 'utf-8');
    const eero = eeroTs.Eero(
      async (c) => await writeFile(cookiePath, c),
      eeroTs.Client(fetch as unknown as typeof globalThis.fetch),
      cookie
    );

    const account = await eero.account();
    const devices = await Promise.all(
      account.networks.data.map(async ({ url }) => await eero.devices(url))
    );

    const allDevices = devices.flat().map((d) => ({
      name: d.nickname || d.hostname || 'Unknown',
      ip: d.ip,
      mac: d.mac,
      type: d.device_type,
      connected: d.connected,
      wireless: d.wireless,
      signal: d.connectivity?.signal,
      manufacturer: d.manufacturer,
    }));

    return NextResponse.json(allDevices);
  } catch (error) {
    console.error('Eero fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch devices' }, { status: 500 });
  }
}
