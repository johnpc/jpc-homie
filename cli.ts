#!/usr/bin/env node
import 'dotenv/config';
import { createAgent } from './lib/agent';

const haUrl = process.env.HOME_ASSISTANT_URL;
const haToken = process.env.HOME_ASSISTANT_TOKEN;

if (!haUrl || !haToken) {
  console.error('Error: HOME_ASSISTANT_URL and HOME_ASSISTANT_TOKEN must be set');
  process.exit(1);
}

const agent = createAgent(haUrl, haToken);
const prompt = process.argv[2] || 'What devices are available?';

console.log(`\n🏠 Homie\n`);
console.log(`User: ${prompt}\n`);

agent
  .invoke(prompt)
  .then((result) => {
    const lastMessage = result.lastMessage as
      | string
      | { content: Array<{ text?: string }> }
      | { role: string; content: string };

    let messageText = '';
    if (typeof lastMessage === 'string') {
      messageText = lastMessage;
    } else if ('content' in lastMessage && Array.isArray(lastMessage.content)) {
      messageText = lastMessage.content.map((c) => c.text || '').join('');
    } else if ('content' in lastMessage && typeof lastMessage.content === 'string') {
      messageText = lastMessage.content;
    } else {
      messageText = JSON.stringify(lastMessage);
    }

    console.log(`\nAgent: ${messageText}\n`);
  })
  .catch((error: Error) => {
    console.error('Error:', error.message);
    process.exit(1);
  });
