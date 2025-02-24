// src/index.ts
import "reflect-metadata";
import { plainToClass } from "class-transformer";
import { validate } from "class-validator";
import { validator } from "hono/validator";
var parseAndValidate = async (dto, obj, options) => {
  const objInstance = plainToClass(dto, obj, options);
  const errors = await validate(objInstance);
  if (errors.length > 0) {
    return {
      success: false,
      errors
    };
  }
  return { success: true, output: objInstance };
};
var classValidator = (target, dataType, hook, options = { enableImplicitConversion: false }) => (
  // @ts-expect-error not typed well
  validator(target, async (data, c) => {
    const result = await parseAndValidate(dataType, data, options);
    if (hook) {
      const hookResult = hook({ ...result, data, target }, c);
      if (hookResult instanceof Response || hookResult instanceof Promise) {
        if ("response" in hookResult) {
          return hookResult.response;
        }
        return hookResult;
      }
    }
    if (!result.success) {
      return c.json({ errors: result.errors }, 400);
    }
    return result.output;
  })
);
export {
  classValidator
};
