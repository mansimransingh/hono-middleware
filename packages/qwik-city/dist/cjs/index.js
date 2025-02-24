"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.qwikMiddleware = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const qwik_1 = require("@builder.io/qwik");
const server_1 = require("@builder.io/qwik/server");
const request_handler_1 = require("@builder.io/qwik-city/middleware/request-handler");
const qwikMiddleware = (opts) => {
    ;
    globalThis.TextEncoderStream = TextEncoderStream;
    const qwikSerializer = {
        _deserializeData: qwik_1._deserializeData,
        _serializeData: qwik_1._serializeData,
        _verifySerializable: qwik_1._verifySerializable,
    };
    if (opts.manifest) {
        (0, server_1.setServerPlatform)(opts.manifest);
    }
    return async (c, next) => {
        const url = new URL(c.req.url);
        const serverRequestEv = {
            mode: 'server',
            locale: undefined,
            url,
            request: c.req.raw,
            getWritableStream: (status, headers, cookies, resolve) => {
                const { readable, writable } = new TransformStream();
                const response = new Response(readable, {
                    status,
                    headers: (0, request_handler_1.mergeHeadersCookies)(headers, cookies),
                });
                resolve(response);
                return writable;
            },
            getClientConn: () => ({}),
            platform: {},
            env: c.env,
        };
        const handledResponse = await (0, request_handler_1.requestHandler)(serverRequestEv, opts, qwikSerializer);
        if (handledResponse) {
            handledResponse.completion.then((v) => {
                if (v) {
                    console.error(v);
                }
            });
            const response = await handledResponse.response;
            if (response) {
                return response;
            }
        }
        await next();
    };
};
exports.qwikMiddleware = qwikMiddleware;
const resolved = Promise.resolve();
class TextEncoderStream {
    // minimal polyfill implementation of TextEncoderStream
    _writer;
    readable;
    writable;
    constructor() {
        this._writer = null;
        this.readable = {
            pipeTo: (writableStream) => {
                this._writer = writableStream.getWriter();
            },
        };
        this.writable = {
            getWriter: () => {
                if (!this._writer) {
                    throw new Error('No writable stream');
                }
                const encoder = new TextEncoder();
                return {
                    write: async (chunk) => {
                        if (chunk != null) {
                            await this._writer.write(encoder.encode(chunk));
                        }
                    },
                    close: () => this._writer.close(),
                    ready: resolved,
                };
            },
        };
    }
}
