import z from 'zod';
import { makeRoute } from './routes/make';
import { fetchRoute } from './routes/fetch';

Bun.serve({
  async fetch(req) {
    const url = new URL(req.url);

    switch (req.method) {
      case 'POST': {
        switch (url.pathname) {
          case '/make': return makeRoute(req);
        }
        break;
      }
      case 'GET': {
        return fetchRoute(req);
      }
    }

    return new Response("Bun!\n");
  },
});

console.log('hot reload');
