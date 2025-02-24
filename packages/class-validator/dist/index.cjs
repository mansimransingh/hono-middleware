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
  classValidator: () => classValidator
});
module.exports = __toCommonJS(src_exports);
var import_reflect_metadata = require("reflect-metadata");
var import_class_transformer = require("class-transformer");
var import_class_validator = require("class-validator");
var import_validator = require("hono/validator");
var parseAndValidate = async (dto, obj, options) => {
  const objInstance = (0, import_class_transformer.plainToClass)(dto, obj, options);
  const errors = await (0, import_class_validator.validate)(objInstance);
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
  (0, import_validator.validator)(target, async (data, c) => {
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  classValidator
});
