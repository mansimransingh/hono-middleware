// src/index.ts
import { Enforcer } from "casbin";
var casbin = (opt) => {
  return async (c, next) => {
    const enforcer = await opt.newEnforcer;
    if (!(enforcer instanceof Enforcer)) {
      return c.json({ error: "Invalid enforcer" }, 500);
    }
    const isAllowed = await opt.authorizer(c, enforcer);
    if (!isAllowed) {
      return c.json({ error: "Forbidden" }, 403);
    }
    await next();
  };
};
export {
  casbin
};
