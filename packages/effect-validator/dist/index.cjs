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
  effectValidator: () => effectValidator
});
module.exports = __toCommonJS(src_exports);
var import_effect = require("effect");
var import_validator = require("hono/validator");
var effectValidator = (target, schema) => {
  return (0, import_validator.validator)(target, async (value, c) => {
    const result = import_effect.Schema.decodeUnknownEither(schema)(value);
    return import_effect.Either.match(result, {
      onLeft: (error) => c.json({ success: false, error: import_effect.ParseResult.ArrayFormatter.formatErrorSync(error) }, 400),
      onRight: (data) => {
        c.req.addValidatedData(target, data);
        return data;
      }
    });
  });
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  effectValidator
});
