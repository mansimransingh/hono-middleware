import type { ServerRenderOptions } from '@builder.io/qwik-city/middleware/request-handler';
import type { MiddlewareHandler } from 'hono';
export declare const qwikMiddleware: (opts: ServerRenderOptions) => MiddlewareHandler;
