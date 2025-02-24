"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  bunTranspiler: () => bunTranspiler,
  defaultOptions: () => defaultOptions
});
module.exports = __toCommonJS(src_exports);
var import_bun = __toESM(require("bun"));
var import_factory = require("hono/factory");
var defaultOptions = {
  extensions: [".ts", ".tsx"],
  headers: { "content-type": "application/javascript" },
  transpilerOptions: {
    minifyWhitespace: true,
    target: "browser"
  }
};
var bunTranspiler = (options) => {
  return (0, import_factory.createMiddleware)(async (c, next) => {
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
      const transpiler = new import_bun.default.Transpiler({
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  bunTranspiler,
  defaultOptions
});
