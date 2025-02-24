// src/index.ts
import { Ajv } from "ajv";
import { validator } from "hono/validator";
function ajvValidator(target, schema, hook) {
  const ajv = new Ajv();
  const validate = ajv.compile(schema);
  return validator(target, (data, c) => {
    const valid = validate(data);
    if (valid) {
      if (hook) {
        const hookResult = hook({ success: true, data }, c);
        if (hookResult instanceof Response || hookResult instanceof Promise) {
          return hookResult;
        }
      }
      return data;
    }
    const errors = validate.errors || [];
    if (hook) {
      const hookResult = hook({ success: false, errors }, c);
      if (hookResult instanceof Response || hookResult instanceof Promise) {
        return hookResult;
      }
    }
    return c.json({ success: false, errors }, 400);
  });
}
export {
  ajvValidator
};
