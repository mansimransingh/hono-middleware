// src/index.ts
import Bun from "bun";
import { createMiddleware } from "hono/factory";
var defaultOptions = {
  extensions: [".ts", ".tsx"],
  headers: { "content-type": "application/javascript" },
  transpilerOptions: {
    minifyWhitespace: true,
    target: "browser"
  }
};
var bunTranspiler = (options) => {
  return createMiddleware(async (c, next) => {
    await next();
    const url = new URL(c.req.url);
    const extensions = options?.extensions ?? defaultOptions.extensions;
    const headers = options?.headers ?? defaultOptions.headers;
    if (extensions?.every((ext) => !url.pathname.endsWith(ext))) {
      return;
    }
    try {
      const loader = url.pathname.split(".").pop();
      const transpilerOptions = options?.transpilerOptions ?? defaultOptions.transpilerOptions;
      const transpiler = new Bun.Transpiler({
        loader,
        ...transpilerOptions
      });
      const transpiledCode = await transpiler.transformSync(await c.res.text());
      c.res = c.newResponse(transpiledCode, 200, headers);
    } catch (error) {
      console.warn(`Error transpiling ${url.pathname}: ${error}`);
      const errorHeaders = {
        ...headers,
        "content-type": "text/plain"
      };
      if (error instanceof Error) {
        c.res = c.newResponse(error.message, 500, errorHeaders);
      } else {
        c.res = c.newResponse("Malformed Input", 500, errorHeaders);
      }
    }
  });
};
export {
  bunTranspiler,
  defaultOptions
};
