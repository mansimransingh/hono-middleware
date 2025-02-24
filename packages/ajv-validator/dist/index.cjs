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
  ajvValidator: () => ajvValidator
});
module.exports = __toCommonJS(src_exports);
var import_ajv = require("ajv");
var import_validator = require("hono/validator");
function ajvValidator(target, schema, hook) {
  const ajv = new import_ajv.Ajv();
  const validate = ajv.compile(schema);
  return (0, import_validator.validator)(target, (data, c) => {
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ajvValidator
});
