// src/transpilers/node.ts
import * as esbuild from "esbuild";
import { createMiddleware as createMiddleware2 } from "hono/factory";

// src/transpiler.ts
import { createMiddleware } from "hono/factory";
var esbuildTranspiler = (options) => {
  const esbuild2 = options?.esbuild;
  return createMiddleware(async (c, next) => {
    await next();
    if (esbuild2) {
      const url = new URL(c.req.url);
      const extensions = options?.extensions ?? [".ts", ".tsx"];
      if (extensions.every((ext) => !url.pathname.endsWith(ext))) {
        return;
      }
      const script = await c.res.text();
      const transformOptions = options?.transformOptions ?? {};
      try {
        const { code } = await esbuild2.transform(script, {
          loader: "tsx",
          ...transformOptions
        });
        c.res = c.body(code);
        c.res.headers.set("content-type", options?.contentType ?? "text/javascript");
        c.res.headers.delete("content-length");
      } catch (ex) {
        console.warn("Error transpiling " + url.pathname + ": " + ex);
        c.res = new Response(script, {
          status: 500,
          headers: { "content-type": options?.contentType ?? "text/javascript" }
        });
      }
    }
  });
};

// src/transpilers/node.ts
var transpiler = (options) => {
  return createMiddleware2(async (c, next) => {
    return await esbuildTranspiler({
      esbuild,
      ...options
    })(c, next);
  });
};
export {
  transpiler as esbuildTranspiler
};
