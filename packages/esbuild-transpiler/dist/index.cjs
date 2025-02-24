"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  esbuildTranspiler: () => esbuildTranspiler
});
module.exports = __toCommonJS(src_exports);

// src/transpiler.ts
var import_factory = require("hono/factory");
var esbuildTranspiler = (options) => {
  const esbuild = options?.esbuild;
  return (0, import_factory.createMiddleware)(async (c, next) => {
    await next();
    if (esbuild) {
      const url = new URL(c.req.url);
      const extensions = options?.extensions ?? [".ts", ".tsx"];
      if (extensions.every((ext) => !url.pathname.endsWith(ext))) {
        return;
      }
      const script = await c.res.text();
      const transformOptions = options?.transformOptions ?? {};
      try {
        const { code } = await esbuild.transform(script, {
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  esbuildTranspiler
});
