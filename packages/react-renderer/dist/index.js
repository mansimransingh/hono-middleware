// src/react-renderer.ts
import React from "react";
import { renderToString } from "react-dom/server";
var RequestContext = React.createContext(null);
var createRenderer = (c, Layout, component, options) => async (children, props) => {
  const node = component ? component({ children, Layout, c, ...props }) : children;
  if (options?.stream) {
    const { renderToReadableStream } = await import("react-dom/server");
    const stream = await renderToReadableStream(
      React.createElement(RequestContext.Provider, { value: c }, node),
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
    const body = docType + renderToString(React.createElement(RequestContext.Provider, { value: c }, node));
    return c.html(body);
  }
};
var reactRenderer = (component, options) => function reactRenderer2(c, next) {
  const Layout = c.getLayout() ?? React.Fragment;
  if (component) {
    c.setLayout((props) => {
      return component({ ...props, Layout, c }, c);
    });
  }
  c.setRenderer(createRenderer(c, Layout, component, options));
  return next();
};
var useRequestContext = () => {
  const c = React.useContext(RequestContext);
  if (!c) {
    throw new Error("RequestContext is not provided.");
  }
  return c;
};
export {
  reactRenderer,
  useRequestContext
};
