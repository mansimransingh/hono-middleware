// src/index.ts
import { validator } from "hono/validator";
import { safeParseAsync } from "valibot";
var vValidator = (target, schema, hook) => (
  // @ts-expect-error not typed well
  validator(target, async (value, c) => {
    const result = await safeParseAsync(schema, value);
    if (hook) {
      const hookResult = await hook({ ...result, target }, c);
      if (hookResult) {
        if (hookResult instanceof Response) {
          return hookResult;
        }
        if ("response" in hookResult) {
          return hookResult.response;
        }
      }
    }
    if (!result.success) {
      return c.json(result, 400);
    }
    return result.output;
  })
);
export {
  vValidator
};
