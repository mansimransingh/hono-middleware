import * as hono_types from 'hono/types';
import { EsbuildTranspilerOptions } from '../transpiler.js';
import '../types.esbuild.js';

declare const transpiler: (options: Partial<Omit<EsbuildTranspilerOptions, 'esbuild'>> & {
    wasmModule?: WebAssembly.Module;
    wasmURL?: string | URL;
}) => hono_types.MiddlewareHandler<any, any, {}>;

export { transpiler as esbuildTranspiler };
