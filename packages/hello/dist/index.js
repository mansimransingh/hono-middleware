// src/index.ts
import { createMiddleware } from "hono/factory";
var hello = (message = "Hello!") => {
  return createMiddleware(async (c, next) => {
    await next();
    c.res.headers.append("X-Message", message);
  });
};
export {
  hello
};
