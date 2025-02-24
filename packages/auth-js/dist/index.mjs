// src/index.ts
import { Auth, setEnvDefaults as coreSetEnvDefaults } from "@auth/core";
import { env } from "hono/adapter";
import { HTTPException } from "hono/http-exception";
function setEnvDefaults(env2, config) {
  config.secret ??= env2.AUTH_SECRET;
  coreSetEnvDefaults(env2, config);
}
function reqWithEnvUrl(req, authUrl) {
  if (authUrl) {
    const reqUrlObj = new URL(req.url);
    const authUrlObj = new URL(authUrl);
    const props = ["hostname", "protocol", "port", "password", "username"];
    for (const prop of props) {
      if (authUrlObj[prop]) {
        reqUrlObj[prop] = authUrlObj[prop];
      }
    }
    return new Request(reqUrlObj.href, req);
  }
  const url = new URL(req.url);
  const newReq = new Request(url.href, req);
  const proto = newReq.headers.get("x-forwarded-proto");
  const host = newReq.headers.get("x-forwarded-host") ?? newReq.headers.get("host");
  if (proto != null) {
    url.protocol = proto.endsWith(":") ? proto : `${proto}:`;
  }
  if (host != null) {
    url.host = host;
    const portMatch = host.match(/:(\d+)$/);
    if (portMatch) {
      url.port = portMatch[1];
    } else {
      url.port = "";
    }
    newReq.headers.delete("x-forwarded-host");
    newReq.headers.delete("Host");
    newReq.headers.set("Host", host);
  }
  return new Request(url.href, newReq);
}
async function getAuthUser(c) {
  const config = c.get("authConfig");
  const ctxEnv = env(c);
  setEnvDefaults(ctxEnv, config);
  const authReq = reqWithEnvUrl(c.req.raw, ctxEnv.AUTH_URL);
  const origin = new URL(authReq.url).origin;
  const request = new Request(`${origin}${config.basePath}/session`, {
    headers: { cookie: c.req.header("cookie") ?? "" }
  });
  let authUser = {};
  const response = await Auth(request, {
    ...config,
    callbacks: {
      ...config.callbacks,
      async session(...args) {
        authUser = args[0];
        const session2 = await config.callbacks?.session?.(...args) ?? args[0].session;
        const user = args[0].user ?? args[0].token;
        return { user, ...session2 };
      }
    }
  });
  const session = await response.json();
  return session?.user ? authUser : null;
}
function verifyAuth() {
  return async (c, next) => {
    const authUser = await getAuthUser(c);
    const isAuth = !!authUser?.token || !!authUser?.user;
    if (!isAuth) {
      const res = new Response("Unauthorized", {
        status: 401
      });
      throw new HTTPException(401, { res });
    }
    c.set("authUser", authUser);
    await next();
  };
}
function initAuthConfig(cb) {
  return async (c, next) => {
    const config = cb(c);
    c.set("authConfig", config);
    await next();
  };
}
function authHandler() {
  return async (c) => {
    const config = c.get("authConfig");
    const ctxEnv = env(c);
    setEnvDefaults(ctxEnv, config);
    if (!config.secret || config.secret.length === 0) {
      throw new HTTPException(500, { message: "Missing AUTH_SECRET" });
    }
    const res = await Auth(reqWithEnvUrl(c.req.raw, ctxEnv.AUTH_URL), config);
    return new Response(res.body, res);
  };
}
export {
  authHandler,
  getAuthUser,
  initAuthConfig,
  reqWithEnvUrl,
  setEnvDefaults,
  verifyAuth
};
