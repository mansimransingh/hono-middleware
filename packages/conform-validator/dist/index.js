// src/utils.ts
import { bufferToFormData } from "hono/utils/buffer";
var multipartRegex = /^multipart\/form-data(; boundary=[A-Za-z0-9'()+_,\-./:=?]+)?$/;
var urlencodedRegex = /^application\/x-www-form-urlencoded$/;
var getFormDataFromContext = async (ctx) => {
  const contentType = ctx.req.header("Content-Type");
  if (!contentType || !(multipartRegex.test(contentType) || urlencodedRegex.test(contentType))) {
    return new FormData();
  }
  const cache = ctx.req.bodyCache.formData;
  if (cache) {
    return cache;
  }
  const arrayBuffer = await ctx.req.arrayBuffer();
  const formData = await bufferToFormData(arrayBuffer, contentType);
  ctx.req.bodyCache.formData = formData;
  return formData;
};

// src/index.ts
var conformValidator = (parse, hook) => {
  return async (c, next) => {
    const formData = await getFormDataFromContext(c);
    const submission = await parse(formData);
    if (hook) {
      const hookResult = hook(submission, c);
      if (hookResult instanceof Response || hookResult instanceof Promise) {
        return hookResult;
      }
    }
    if (submission.status !== "success") {
      return c.json(submission.reply(), 400);
    }
    c.req.addValidatedData("form", submission);
    await next();
  };
};
export {
  conformValidator
};
