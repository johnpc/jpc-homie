# Eero API Setup

This directory contains API routes for Eero network integration.

## Getting the Eero Session Cookie

The Eero API requires authentication via a session cookie. Follow these steps to obtain it:

### 1. Install Dependencies

```bash
npm install
```

### 2. Create Authentication Script

Create a file `eero-auth.ts` in the project root:

```typescript
import * as eeroTs from '@343max/eero-ts';
import fetch from 'node-fetch';
import { writeFile } from 'fs/promises';
import { createInterface } from 'readline';

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (q: string): Promise<string> => 
  new Promise((resolve) => rl.question(q, resolve));

const cookieFile = 'eero-session.cookie';

const eero = eeroTs.Eero(
  async (cookie) => await writeFile(cookieFile, cookie),
  eeroTs.Client(fetch as any),
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
```

### 3. Run Authentication

```bash
npx ts-node eero-auth.ts
```

Enter your Eero account email and the verification code sent to you.

### 4. Cookie File Location

The session cookie will be saved to `eero-session.cookie` in the project root.

### 5. Configure Environment Variable

Add to your `.env` file:

```
EERO_COOKIE_PATH=/path/to/eero-session.cookie
```

For Docker, mount the cookie file as a volume (see main README).

## Cookie Refresh

The cookie is automatically refreshed when making API calls. It will be updated in the file specified by `EERO_COOKIE_PATH`.

## Troubleshooting

**Rate Limiting**: If you get `error.login.blocked`, wait 15-30 minutes before trying again. The Eero API rate-limits login attempts.

**Cookie Expiration**: If the cookie expires after long periods of inactivity, re-run the authentication script.

**Private Wi-Fi Address**: For better device identification, disable "Private Wi-Fi Address" for your home network on iOS devices (Settings → Wi-Fi → tap network → toggle off).
