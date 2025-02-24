import * as hono_types from 'hono/types';
import { EsbuildTranspilerOptions } from '../transpiler.js';
import '../types.esbuild.js';

declare const transpiler: (options?: Partial<Omit<EsbuildTranspilerOptions, 'esbuild'>>) => hono_types.MiddlewareHandler<any, any, {}>;

export { transpiler as esbuildTranspiler };
