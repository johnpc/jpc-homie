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

    const allPhones = devices.flat().filter((d) => {
      const name = (d.nickname || d.hostname || '').toLowerCase();
      return (
        d.wireless &&
        (name.includes('iphone') || (name.includes('android') && name.includes('phone')))
      );
    });

    const phoneData = allPhones.map((d) => {
      const name = (d.nickname || d.hostname || '').toLowerCase();
      const isIOS =
        name.includes('iphone') ||
        name.includes('watch') ||
        (!name.includes('android') && d.is_private);
      return {
        name: d.nickname || d.hostname,
        ip: d.ip,
        mac: d.mac,
        type: isIOS ? 'ios' : 'android',
        connected: d.connected,
        wireless: d.wireless,
        signal: d.connectivity?.signal,
      };
    });

    return NextResponse.json(phoneData);
  } catch (error) {
    console.error('Eero fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch phones' }, { status: 500 });
  }
}
