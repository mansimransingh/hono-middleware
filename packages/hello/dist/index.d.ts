import * as hono_types from 'hono/types';

declare const hello: (message?: string) => hono_types.MiddlewareHandler<any, any, {}>;

export { hello };
