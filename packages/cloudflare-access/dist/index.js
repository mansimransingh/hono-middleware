// src/index.ts
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
var cloudflareAccess = (accessTeamName) => {
  let cacheKeys = {};
  let cacheExpiration = 0;
  return createMiddleware(async (c, next) => {
    const encodedToken = getJwt(c);
    if (encodedToken === null) {
      return c.text("Authentication error: Missing bearer token", 401);
    }
    if (Object.keys(cacheKeys).length === 0 || Math.floor(Date.now() / 1e3) < cacheExpiration) {
      const publicKeys = await getPublicKeys(accessTeamName);
      cacheKeys = publicKeys.keys;
      cacheExpiration = publicKeys.cacheExpiration;
    }
    let token;
    try {
      token = decodeJwt(encodedToken);
    } catch (err) {
      return c.text("Authentication error: Unable to decode Bearer token", 401);
    }
    const expiryDate = new Date(token.payload.exp * 1e3);
    const currentDate = new Date(Date.now());
    if (expiryDate <= currentDate) {
      return c.text("Authentication error: Token is expired", 401);
    }
    if (!await isValidJwtSignature(token, cacheKeys)) {
      return c.text("Authentication error: Invalid Token", 401);
    }
    const expectedIss = `https://${accessTeamName}.cloudflareaccess.com`;
    if (token.payload?.iss !== expectedIss) {
      return c.text(
        `Authentication error: Expected team name ${expectedIss}, but received ${token.payload?.iss}`,
        401
      );
    }
    c.set("accessPayload", token.payload);
    await next();
  });
};
async function getPublicKeys(accessTeamName) {
  const jwtUrl = `https://${accessTeamName}.cloudflareaccess.com/cdn-cgi/access/certs`;
  const result = await fetch(jwtUrl, {
    method: "GET",
    cf: {
      // Dont cache error responses
      cacheTtlByStatus: { "200-299": 30, "300-599": 0 }
    }
  });
  if (!result.ok) {
    if (result.status === 404) {
      throw new HTTPException(500, {
        message: `Authentication error: The Access Organization '${accessTeamName}' does not exist`
      });
    }
    throw new HTTPException(500, {
      message: `Authentication error: Received unexpected HTTP code ${result.status} from Cloudflare Access`
    });
  }
  const data = await result.json();
  const cacheExpiration = Math.floor(Date.now() / 1e3) + 3600;
  const importedKeys = {};
  for (const key of data.keys) {
    importedKeys[key.kid] = await crypto.subtle.importKey(
      "jwk",
      key,
      {
        name: "RSASSA-PKCS1-v1_5",
        hash: "SHA-256"
      },
      false,
      ["verify"]
    );
  }
  return {
    keys: importedKeys,
    cacheExpiration
  };
}
function getJwt(c) {
  const authHeader = c.req.header("cf-access-jwt-assertion");
  if (!authHeader) {
    return null;
  }
  return authHeader.trim();
}
function decodeJwt(token) {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid token");
  }
  const header = JSON.parse(atob(parts[0]));
  const payload = JSON.parse(atob(parts[1]));
  const signature = atob(parts[2].replace(/_/g, "/").replace(/-/g, "+"));
  return {
    header,
    payload,
    signature,
    raw: { header: parts[0], payload: parts[1], signature: parts[2] }
  };
}
async function isValidJwtSignature(token, keys) {
  const encoder = new TextEncoder();
  const data = encoder.encode([token.raw.header, token.raw.payload].join("."));
  const signature = new Uint8Array(Array.from(token.signature).map((c) => c.charCodeAt(0)));
  for (const key of Object.values(keys)) {
    const isValid = await validateSingleKey(key, signature, data);
    if (isValid) {
      return true;
    }
  }
  return false;
}
async function validateSingleKey(key, signature, data) {
  return crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, signature, data);
}
export {
  cloudflareAccess
};
