"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  conformValidator: () => conformValidator
});
module.exports = __toCommonJS(src_exports);

// src/utils.ts
var import_buffer = require("hono/utils/buffer");
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
  const formData = await (0, import_buffer.bufferToFormData)(arrayBuffer, contentType);
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  conformValidator
});
