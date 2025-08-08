import type { APIRoute } from 'astro';
import eventEmitter from '../../../lib/event-emitter';

export const GET: APIRoute = async ({ request }) => {
  const body = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      const listener = (message: string) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ message })}\n\n`));
      };

      eventEmitter.on('restore-progress', listener);

      request.signal.addEventListener('abort', () => {
        eventEmitter.off('restore-progress', listener);
        controller.close();
      });
    },
  });

  return new Response(body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
};
