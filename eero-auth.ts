import * as eeroTs from '@343max/eero-ts';
import fetch from 'node-fetch';
import { writeFile } from 'fs/promises';
import { createInterface } from 'readline';

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (q: string): Promise<string> => new Promise((resolve) => rl.question(q, resolve));

const cookieFile = 'eero-session.cookie';

const eero = eeroTs.Eero(
  async (cookie) => await writeFile(cookieFile, cookie),
  eeroTs.Client(fetch as unknown as typeof globalThis.fetch),
  null
);

console.log('Starting Eero authentication...');
const email = await question('Email: ');
await eero.login(email);
console.log('Verification code sent to your email/SMS');

const code = await question('Enter verification code: ');
rl.close();

await eero.loginVerify(code.trim());
console.log(`Login successful! Cookie saved to ${cookieFile}`);
