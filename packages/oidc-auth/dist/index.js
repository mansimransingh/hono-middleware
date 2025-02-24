// src/index.ts
import { env } from "hono/adapter";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { sign, verify } from "hono/jwt";
import * as oauth2 from "oauth4webapi";
var defaultOidcRedirectUri = "/callback";
var defaultOidcAuthCookiePath = "/";
var defaultOidcAuthCookieName = "oidc-auth";
var defaultRefreshInterval = 15 * 60;
var defaultExpirationInterval = 60 * 60 * 24;
var getOidcAuthEnv = (c) => {
  let oidcAuthEnv = c.get("oidcAuthEnv");
  if (oidcAuthEnv === void 0) {
    oidcAuthEnv = env(c);
    if (oidcAuthEnv.OIDC_AUTH_SECRET === void 0) {
      throw new HTTPException(500, { message: "Session secret is not provided" });
    }
    if (oidcAuthEnv.OIDC_AUTH_SECRET.length < 32) {
      throw new HTTPException(500, {
        message: "Session secrets must be at least 32 characters long"
      });
    }
    if (oidcAuthEnv.OIDC_ISSUER === void 0) {
      throw new HTTPException(500, { message: "OIDC issuer is not provided" });
    }
    if (oidcAuthEnv.OIDC_CLIENT_ID === void 0) {
      throw new HTTPException(500, { message: "OIDC client ID is not provided" });
    }
    if (oidcAuthEnv.OIDC_CLIENT_SECRET === void 0) {
      throw new HTTPException(500, { message: "OIDC client secret is not provided" });
    }
    oidcAuthEnv.OIDC_REDIRECT_URI = oidcAuthEnv.OIDC_REDIRECT_URI ?? defaultOidcRedirectUri;
    if (!oidcAuthEnv.OIDC_REDIRECT_URI.startsWith("/")) {
      try {
        new URL(oidcAuthEnv.OIDC_REDIRECT_URI);
      } catch (e) {
        throw new HTTPException(500, {
          message: "The OIDC redirect URI is invalid. It must be a full URL or an absolute path"
        });
      }
    }
    oidcAuthEnv.OIDC_COOKIE_PATH = oidcAuthEnv.OIDC_COOKIE_PATH ?? defaultOidcAuthCookiePath;
    oidcAuthEnv.OIDC_COOKIE_NAME = oidcAuthEnv.OIDC_COOKIE_NAME ?? defaultOidcAuthCookieName;
    oidcAuthEnv.OIDC_AUTH_REFRESH_INTERVAL = oidcAuthEnv.OIDC_AUTH_REFRESH_INTERVAL ?? `${defaultRefreshInterval}`;
    oidcAuthEnv.OIDC_AUTH_EXPIRES = oidcAuthEnv.OIDC_AUTH_EXPIRES ?? `${defaultExpirationInterval}`;
    oidcAuthEnv.OIDC_SCOPES = oidcAuthEnv.OIDC_SCOPES ?? "";
    c.set("oidcAuthEnv", oidcAuthEnv);
  }
  return oidcAuthEnv;
};
var getAuthorizationServer = async (c) => {
  const env2 = getOidcAuthEnv(c);
  let as = c.get("oidcAuthorizationServer");
  if (as === void 0) {
    const issuer = new URL(env2.OIDC_ISSUER);
    const response = await oauth2.discoveryRequest(issuer);
    as = await oauth2.processDiscoveryResponse(issuer, response);
    c.set("oidcAuthorizationServer", as);
  }
  return as;
};
var getClient = (c) => {
  const env2 = getOidcAuthEnv(c);
  let client = c.get("oidcClient");
  if (client === void 0) {
    client = {
      client_id: env2.OIDC_CLIENT_ID,
      client_secret: env2.OIDC_CLIENT_SECRET,
      token_endpoint_auth_method: "client_secret_basic"
    };
    c.set("oidcClient", client);
  }
  return client;
};
var getAuth = async (c) => {
  const env2 = getOidcAuthEnv(c);
  let auth = c.get("oidcAuth");
  if (auth === void 0) {
    const session_jwt = getCookie(c, env2.OIDC_COOKIE_NAME);
    if (session_jwt === void 0) {
      return null;
    }
    try {
      auth = await verify(session_jwt, env2.OIDC_AUTH_SECRET);
    } catch (e) {
      deleteCookie(c, env2.OIDC_COOKIE_NAME, { path: env2.OIDC_COOKIE_PATH });
      return null;
    }
    if (auth === null || auth.rtkexp === void 0 || auth.ssnexp === void 0) {
      throw new HTTPException(500, { message: "Invalid session" });
    }
    const now = Math.floor(Date.now() / 1e3);
    if (auth.ssnexp < now) {
      revokeSession(c);
      return null;
    }
    if (auth.rtkexp < now) {
      if (auth.rtk === void 0 || auth.rtk === "") {
        deleteCookie(c, env2.OIDC_COOKIE_NAME, { path: env2.OIDC_COOKIE_PATH });
        return null;
      }
      const as = await getAuthorizationServer(c);
      const client = getClient(c);
      const response = await oauth2.refreshTokenGrantRequest(as, client, auth.rtk);
      const result = await oauth2.processRefreshTokenResponse(as, client, response);
      if (oauth2.isOAuth2Error(result)) {
        deleteCookie(c, env2.OIDC_COOKIE_NAME, { path: env2.OIDC_COOKIE_PATH });
        return null;
      }
      auth = await updateAuth(c, auth, result);
    }
    c.set("oidcAuth", auth);
  }
  return auth;
};
var setAuth = async (c, response) => {
  return updateAuth(c, void 0, response);
};
var updateAuth = async (c, orig, response) => {
  const env2 = getOidcAuthEnv(c);
  const claims = oauth2.getValidatedIdTokenClaims(response);
  const authRefreshInterval = Number(env2.OIDC_AUTH_REFRESH_INTERVAL);
  const authExpires = Number(env2.OIDC_AUTH_EXPIRES);
  const claimsHook = c.get("oidcClaimsHook") ?? (async (orig2, claims2) => {
    return {
      sub: claims2?.sub || orig2?.sub || "",
      email: claims2?.email || orig2?.email || ""
    };
  });
  const updated = {
    ...await claimsHook(orig, claims, response),
    rtk: response.refresh_token || orig?.rtk || "",
    rtkexp: Math.floor(Date.now() / 1e3) + authRefreshInterval,
    ssnexp: orig?.ssnexp || Math.floor(Date.now() / 1e3) + authExpires
  };
  const session_jwt = await sign(updated, env2.OIDC_AUTH_SECRET);
  const cookieOptions = env2.OIDC_COOKIE_DOMAIN == null ? { path: env2.OIDC_COOKIE_PATH, httpOnly: true, secure: true } : { path: env2.OIDC_COOKIE_PATH, domain: env2.OIDC_COOKIE_DOMAIN, httpOnly: true, secure: true };
  setCookie(c, env2.OIDC_COOKIE_NAME, session_jwt, cookieOptions);
  c.set("oidcAuthJwt", session_jwt);
  return updated;
};
var revokeSession = async (c) => {
  const env2 = getOidcAuthEnv(c);
  const session_jwt = getCookie(c, env2.OIDC_COOKIE_NAME);
  if (session_jwt !== void 0) {
    deleteCookie(c, env2.OIDC_COOKIE_NAME, { path: env2.OIDC_COOKIE_PATH });
    const auth = await verify(session_jwt, env2.OIDC_AUTH_SECRET);
    if (auth.rtk !== void 0 && auth.rtk !== "") {
      const as = await getAuthorizationServer(c);
      const client = getClient(c);
      if (as.revocation_endpoint !== void 0) {
        const response = await oauth2.revocationRequest(as, client, auth.rtk);
        const result = await oauth2.processRevocationResponse(response);
        if (oauth2.isOAuth2Error(result)) {
          throw new HTTPException(500, {
            message: `OAuth2Error: [${result.error}] ${result.error_description}`
          });
        }
      }
    }
  }
  c.set("oidcAuth", null);
};
var generateAuthorizationRequestUrl = async (c, state, nonce, code_challenge) => {
  const env2 = getOidcAuthEnv(c);
  const as = await getAuthorizationServer(c);
  const client = getClient(c);
  const authorizationRequestUrl = new URL(as.authorization_endpoint);
  const redirectUri = new URL(env2.OIDC_REDIRECT_URI, c.req.url).toString();
  authorizationRequestUrl.searchParams.set("client_id", client.client_id);
  authorizationRequestUrl.searchParams.set("redirect_uri", redirectUri);
  authorizationRequestUrl.searchParams.set("response_type", "code");
  if (as.scopes_supported === void 0 || as.scopes_supported.length === 0) {
    throw new HTTPException(500, {
      message: "The supported scopes information is not provided by the IdP"
    });
  } else if (env2.OIDC_SCOPES !== "") {
    for (const scope of env2.OIDC_SCOPES.split(" ")) {
      if (as.scopes_supported.indexOf(scope) === -1) {
        throw new HTTPException(500, {
          message: `The '${scope}' scope is not supported by the IdP`
        });
      }
    }
    authorizationRequestUrl.searchParams.set("scope", env2.OIDC_SCOPES);
  } else {
    authorizationRequestUrl.searchParams.set("scope", as.scopes_supported.join(" "));
  }
  authorizationRequestUrl.searchParams.set("state", state);
  authorizationRequestUrl.searchParams.set("nonce", nonce);
  authorizationRequestUrl.searchParams.set("code_challenge", code_challenge);
  authorizationRequestUrl.searchParams.set("code_challenge_method", "S256");
  if (as.issuer === "https://accounts.google.com") {
    authorizationRequestUrl.searchParams.set("access_type", "offline");
    authorizationRequestUrl.searchParams.set("prompt", "consent");
  }
  return authorizationRequestUrl.toString();
};
var processOAuthCallback = async (c) => {
  const env2 = getOidcAuthEnv(c);
  const as = await getAuthorizationServer(c);
  const client = getClient(c);
  const state = getCookie(c, "state");
  const path = new URL(env2.OIDC_REDIRECT_URI, c.req.url).pathname;
  deleteCookie(c, "state", { path });
  const currentUrl = new URL(c.req.url);
  const params = oauth2.validateAuthResponse(as, client, currentUrl, state);
  if (oauth2.isOAuth2Error(params)) {
    throw new HTTPException(500, {
      message: `OAuth2Error: [${params.error}] ${params.error_description}`
    });
  }
  const code = c.req.query("code");
  const nonce = getCookie(c, "nonce");
  deleteCookie(c, "nonce", { path });
  const code_verifier = getCookie(c, "code_verifier");
  deleteCookie(c, "code_verifier", { path });
  const continue_url = getCookie(c, "continue");
  deleteCookie(c, "continue", { path });
  if (code === void 0 || nonce === void 0 || code_verifier === void 0) {
    throw new HTTPException(500, { message: "Missing required parameters / cookies" });
  }
  const redirectUri = new URL(env2.OIDC_REDIRECT_URI, c.req.url).toString();
  const result = await exchangeAuthorizationCode(
    as,
    client,
    params,
    redirectUri,
    nonce,
    code_verifier
  );
  await setAuth(c, result);
  return c.redirect(continue_url || "/");
};
var exchangeAuthorizationCode = async (as, client, params, redirect_uri, nonce, code_verifier) => {
  const response = await oauth2.authorizationCodeGrantRequest(
    as,
    client,
    params,
    redirect_uri,
    code_verifier
  );
  const challenges = oauth2.parseWwwAuthenticateChallenges(response);
  if (challenges !== void 0) {
    throw new HTTPException(500, {
      message: `www-authenticate error: ${JSON.stringify(challenges)}`
    });
  }
  const result = await oauth2.processAuthorizationCodeOpenIDResponse(as, client, response, nonce);
  if (oauth2.isOAuth2Error(result)) {
    throw new HTTPException(500, {
      message: `OAuth2Error: [${result.error}] ${result.error_description}`
    });
  }
  return result;
};
var oidcAuthMiddleware = () => {
  return createMiddleware(async (c, next) => {
    const env2 = getOidcAuthEnv(c);
    const uri = new URL(c.req.url);
    const redirectUri = new URL(env2.OIDC_REDIRECT_URI, c.req.url);
    if (uri.pathname === redirectUri.pathname && uri.origin === redirectUri.origin) {
      return processOAuthCallback(c);
    }
    try {
      const auth = await getAuth(c);
      if (auth === null) {
        const path = new URL(env2.OIDC_REDIRECT_URI, c.req.url).pathname;
        const cookieDomain = env2.OIDC_COOKIE_DOMAIN;
        const state = oauth2.generateRandomState();
        const nonce = oauth2.generateRandomNonce();
        const code_verifier = oauth2.generateRandomCodeVerifier();
        const code_challenge = await oauth2.calculatePKCECodeChallenge(code_verifier);
        const url = await generateAuthorizationRequestUrl(c, state, nonce, code_challenge);
        const cookieOptions = cookieDomain == null ? { path, httpOnly: true, secure: true } : { path, domain: cookieDomain, httpOnly: true, secure: true };
        setCookie(c, "state", state, cookieOptions);
        setCookie(c, "nonce", nonce, cookieOptions);
        setCookie(c, "code_verifier", code_verifier, cookieOptions);
        setCookie(c, "continue", c.req.url, cookieOptions);
        return c.redirect(url);
      }
    } catch (e) {
      deleteCookie(c, env2.OIDC_COOKIE_NAME, { path: env2.OIDC_COOKIE_PATH });
      throw new HTTPException(500, { message: "Invalid session" });
    }
    await next();
    c.res.headers.set("Cache-Control", "private, no-cache");
    const session_jwt = c.get("oidcAuthJwt");
    if (session_jwt !== void 0) {
      setCookie(c, env2.OIDC_COOKIE_NAME, session_jwt, {
        path: env2.OIDC_COOKIE_PATH,
        httpOnly: true,
        secure: true
      });
    }
  });
};
export {
  getAuth,
  getAuthorizationServer,
  getClient,
  oidcAuthMiddleware,
  processOAuthCallback,
  revokeSession
};
