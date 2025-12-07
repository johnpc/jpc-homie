import { NextRequest } from 'next/server';
import { createAgent } from '@/lib/agent';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface AgentRequest {
  prompt: string;
  messages?: Array<{ role: string; content: string }>;
}

export async function POST(req: NextRequest): Promise<Response> {
  try {
    const { prompt, messages }: AgentRequest = await req.json();

    if (!prompt) {
      return Response.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const haUrl = process.env.HOME_ASSISTANT_URL;
    const haToken = process.env.HOME_ASSISTANT_TOKEN;

    if (!haUrl || !haToken) {
      return Response.json({ error: 'Home Assistant not configured' }, { status: 500 });
    }

    const agent = createAgent(haUrl, haToken);

    // Build conversation context
    let conversationContext = '';
    if (messages && messages.length > 0) {
      conversationContext =
        '\n\nPrevious conversation:\n' +
        messages
          .map((msg) => {
            if (msg.role === 'user') return `User: ${msg.content}`;
            if (msg.role === 'assistant') return `Assistant: ${msg.content}`;
            if (msg.role === 'tool') return `[Used tool: ${msg.content}]`;
            return '';
          })
          .filter(Boolean)
          .join('\n') +
        '\n\nCurrent request:';
    }

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const fullPrompt = conversationContext ? conversationContext + '\n' + prompt : prompt;

          for await (const event of agent.stream(fullPrompt)) {
            if (event.type === 'messageAddedEvent' && event.message) {
              const msg = event.message as {
                role: string;
                content: Array<{ type: string; text?: string; name?: string }>;
              };

              if (msg.role !== 'assistant') continue;

              for (const block of msg.content) {
                if (block.type === 'textBlock' && block.text) {
                  const paragraphs = block.text.split('\n\n').filter((p) => p.trim());
                  for (const paragraph of paragraphs) {
                    controller.enqueue(
                      new TextEncoder().encode(
                        `data: ${JSON.stringify({ type: 'text', content: paragraph })}\n\n`
                      )
                    );
                  }
                } else if (block.type === 'toolUseBlock' && block.name) {
                  controller.enqueue(
                    new TextEncoder().encode(
                      `data: ${JSON.stringify({ type: 'tool', name: block.name })}\n\n`
                    )
                  );
                }
              }
            }
          }
          controller.enqueue(
            new TextEncoder().encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`)
          );
          controller.close();
        } catch (error) {
          console.error('Stream error:', error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Agent API error:', error);
    return Response.json(
      {
        error: 'Failed to process request',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
