import { Context } from 'hono';
import { MiddlewareHandler, Env } from 'hono/types';
import React$1 from 'react';
import { RenderToReadableStreamOptions } from 'react-dom/server';

type RendererOptions = {
    docType?: boolean | string;
    stream?: boolean | Record<string, string>;
    readableStreamOptions?: RenderToReadableStreamOptions;
};
type BaseProps = {
    c: Context;
    children: React$1.ReactElement;
};
type ComponentProps = Props & BaseProps & {
    Layout: React$1.FC<Record<string, any> & {
        children: React$1.ReactElement;
    }>;
};
declare const reactRenderer: (component?: React$1.FC<ComponentProps>, options?: RendererOptions) => MiddlewareHandler;
declare const useRequestContext: <E extends Env = any>() => Context<E, any, {}>;

interface Props {
}
declare module 'hono' {
    interface ContextRenderer {
        (children: React.ReactElement, props?: Props): Response | Promise<Response>;
    }
}

export { type Props, reactRenderer, useRequestContext };
