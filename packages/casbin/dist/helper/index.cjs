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

// src/helper/index.ts
var helper_exports = {};
__export(helper_exports, {
  basicAuthorizer: () => basicAuthorizer,
  jwtAuthorizer: () => jwtAuthorizer
});
module.exports = __toCommonJS(helper_exports);

// src/helper/jwt.ts
var import_jwt = require("hono/jwt");
var jwtAuthorizer = async (c, enforcer, claimMapping = { userID: "sub" }) => {
  let payload = c.get("jwtPayload");
  if (!payload) {
    const credentials = c.req.header("Authorization");
    if (!credentials) {
      return false;
    }
    const parts = credentials.split(/\s+/);
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return false;
    }
    const token = parts[1];
    try {
      const decoded = (0, import_jwt.decode)(token);
      payload = decoded.payload;
    } catch {
      return false;
    }
  }
  const args = Object.values(claimMapping).map((key) => payload[key]);
  const { path, method } = c.req;
  return await enforcer.enforce(...args, path, method);
};

// src/helper/basic-auth.ts
var import_basic_auth = require("hono/utils/basic-auth");
var getUserName = (c) => {
  const requestUser = (0, import_basic_auth.auth)(c.req.raw);
  if (!requestUser) {
    return "";
  }
  return requestUser.username;
};
var basicAuthorizer = async (c, enforcer) => {
  const { path, method } = c.req;
  const user = getUserName(c);
  return enforcer.enforce(user, path, method);
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  basicAuthorizer,
  jwtAuthorizer
});
