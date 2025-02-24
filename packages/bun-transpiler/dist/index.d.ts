import * as hono_types from 'hono/types';
import Bun from 'bun';

type BunTranspilerOptions = {
    extensions?: string[];
    headers?: Record<string, string | string[]>;
    transpilerOptions?: Bun.TranspilerOptions;
};
declare const defaultOptions: Required<BunTranspilerOptions>;
declare const bunTranspiler: (options?: BunTranspilerOptions) => hono_types.MiddlewareHandler<any, any, {}>;

export { bunTranspiler, defaultOptions };
