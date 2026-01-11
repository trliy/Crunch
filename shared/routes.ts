
import { z } from 'zod';
import { manifestSchema, streamSchema, metaSchema } from './schema';

export const api = {
  addon: {
    manifest: {
      method: 'GET' as const,
      path: '/manifest.json',
      responses: {
        200: manifestSchema,
      },
    },
    catalog: {
      method: 'GET' as const,
      path: '/catalog/:type/:id.json',
      // Stremio also supports /catalog/:type/:id/:extraArgs.json but we'll stick to simple for now
      // or handle via wildcard in backend logic if needed, but for shared routes we define the base
      responses: {
        200: z.object({
          metas: z.array(metaSchema),
        }),
      },
    },
    meta: {
      method: 'GET' as const,
      path: '/meta/:type/:id.json',
      responses: {
        200: z.object({
          meta: metaSchema,
        }),
      },
    },
    stream: {
      method: 'GET' as const,
      path: '/stream/:type/:id.json',
      responses: {
        200: z.object({
          streams: z.array(streamSchema),
        }),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
