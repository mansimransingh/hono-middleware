// src/index.ts
import { type } from "arktype";
import { validator } from "hono/validator";
var arktypeValidator = (target, schema, hook) => validator(target, (value, c) => {
  const out = schema(value);
  const hasErrors = out instanceof type.errors;
  if (hook) {
    const hookResult = hook(
      hasErrors ? { success: false, data: value, errors: out } : { success: true, data: out },
      c
    );
    if (hookResult) {
      if (hookResult instanceof Response || hookResult instanceof Promise) {
        return hookResult;
      }
      if ("response" in hookResult) {
        return hookResult.response;
      }
    }
  }
  if (hasErrors) {
    return c.json(
      {
        success: false,
        errors: out
      },
      400
    );
  }
  return out;
});
export {
  arktypeValidator
};
