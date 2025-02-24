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
  reactRenderer: () => reactRenderer,
  useRequestContext: () => useRequestContext
});
module.exports = __toCommonJS(src_exports);

// src/react-renderer.ts
var import_react = __toESM(require("react"), 1);
var import_server = require("react-dom/server");
var RequestContext = import_react.default.createContext(null);
var createRenderer = (c, Layout, component, options) => async (children, props) => {
  const node = component ? component({ children, Layout, c, ...props }) : children;
  if (options?.stream) {
    const { renderToReadableStream } = await import("react-dom/server");
    const stream = await renderToReadableStream(
      import_react.default.createElement(RequestContext.Provider, { value: c }, node),
      options.readableStreamOptions
    );
    if (options.stream === true) {
      c.header("Transfer-Encoding", "chunked");
      c.header("Content-Type", "text/html; charset=UTF-8");
    } else {
      for (const [key, value] of Object.entries(options.stream)) {
        c.header(key, value);
      }
    }
    return c.body(stream);
  } else {
    const docType = typeof options?.docType === "string" ? options.docType : options?.docType === false ? "" : "<!DOCTYPE html>";
    const body = docType + (0, import_server.renderToString)(import_react.default.createElement(RequestContext.Provider, { value: c }, node));
    return c.html(body);
  }
};
var reactRenderer = (component, options) => function reactRenderer2(c, next) {
  const Layout = c.getLayout() ?? import_react.default.Fragment;
  if (component) {
    c.setLayout((props) => {
      return component({ ...props, Layout, c }, c);
    });
  }
  c.setRenderer(createRenderer(c, Layout, component, options));
  return next();
};
var useRequestContext = () => {
  const c = import_react.default.useContext(RequestContext);
  if (!c) {
    throw new Error("RequestContext is not provided.");
  }
  return c;
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  reactRenderer,
  useRequestContext
});
