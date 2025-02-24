// src/helper/jwt.ts
import { decode } from "hono/jwt";
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
      const decoded = decode(token);
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
import { auth } from "hono/utils/basic-auth";
var getUserName = (c) => {
  const requestUser = auth(c.req.raw);
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
export {
  basicAuthorizer,
  jwtAuthorizer
};
