// src/index.ts
import { createMiddleware } from "hono/factory";
import { container } from "tsyringe";
var tsyringe = (...providers) => {
  return createMiddleware(async (c, next) => {
    const childContainer = container.createChildContainer();
    providers.forEach((provider) => provider(childContainer));
    c.set("resolve", (token) => childContainer.resolve(token));
    await next();
  });
};
export {
  tsyringe
};
