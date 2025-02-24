import * as hono_types from 'hono/types';
import { transform, initialize } from './types.esbuild.js';

type EsbuildLike = {
    transform: typeof transform;
    initialize: typeof initialize;
};
type TransformOptions = Partial<Parameters<typeof transform>[1]>;
type EsbuildTranspilerOptions = {
    extensions?: string[];
    cache?: boolean;
    esbuild?: EsbuildLike;
    contentType?: string;
    transformOptions?: TransformOptions;
};
declare const esbuildTranspiler: (options?: EsbuildTranspilerOptions) => hono_types.MiddlewareHandler<any, any, {}>;

export { type EsbuildLike, type EsbuildTranspilerOptions, type TransformOptions, esbuildTranspiler };
