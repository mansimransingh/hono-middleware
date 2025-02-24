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
  arktypeValidator: () => arktypeValidator
});
module.exports = __toCommonJS(src_exports);
var import_arktype = require("arktype");
var import_validator = require("hono/validator");
var arktypeValidator = (target, schema, hook) => (0, import_validator.validator)(target, (value, c) => {
  const out = schema(value);
  const hasErrors = out instanceof import_arktype.type.errors;
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  arktypeValidator
});
