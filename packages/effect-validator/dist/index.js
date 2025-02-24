// src/index.ts
import { Schema as S, ParseResult, Either } from "effect";
import { validator } from "hono/validator";
var effectValidator = (target, schema) => {
  return validator(target, async (value, c) => {
    const result = S.decodeUnknownEither(schema)(value);
    return Either.match(result, {
      onLeft: (error) => c.json({ success: false, error: ParseResult.ArrayFormatter.formatErrorSync(error) }, 400),
      onRight: (data) => {
        c.req.addValidatedData(target, data);
        return data;
      }
    });
  });
};
export {
  effectValidator
};
