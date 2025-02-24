import { OidcAuthClaims, Context, MiddlewareHandler } from 'hono';
import * as oauth2 from 'oauth4webapi';

/**
 * OpenID Connect authentication middleware for hono
 */

type IDToken = oauth2.IDToken;
type TokenEndpointResponses = oauth2.OpenIDTokenEndpointResponse | oauth2.TokenEndpointResponse;
type OidcClaimsHook = (orig: OidcAuth | undefined, claims: IDToken | undefined, response: TokenEndpointResponses) => Promise<OidcAuthClaims>;
declare module 'hono' {
    interface OidcAuthClaims {
        readonly [claim: string]: oauth2.JsonValue | undefined;
    }
    interface ContextVariableMap {
        oidcAuthEnv: OidcAuthEnv;
        oidcAuthorizationServer: oauth2.AuthorizationServer;
        oidcClient: oauth2.Client;
        oidcAuth: OidcAuth | null;
        oidcAuthJwt: string;
        oidcClaimsHook?: OidcClaimsHook;
    }
}
type OidcAuth = {
    rtk: string;
    rtkexp: number;
    ssnexp: number;
} & OidcAuthClaims;
type OidcAuthEnv = {
    OIDC_AUTH_SECRET: string;
    OIDC_AUTH_REFRESH_INTERVAL?: string;
    OIDC_AUTH_EXPIRES?: string;
    OIDC_ISSUER: string;
    OIDC_CLIENT_ID: string;
    OIDC_CLIENT_SECRET: string;
    OIDC_REDIRECT_URI?: string;
    OIDC_SCOPES?: string;
    OIDC_COOKIE_PATH?: string;
    OIDC_COOKIE_NAME?: string;
    OIDC_COOKIE_DOMAIN?: string;
};
/**
 * Returns the OAuth2 authorization server metadata.
 * If the metadata is not cached, it will be retrieved from the discovery endpoint.
 */
declare const getAuthorizationServer: (c: Context) => Promise<oauth2.AuthorizationServer>;
/**
 * Returns the OAuth2 client metadata.
 */
declare const getClient: (c: Context) => oauth2.Client;
/**
 * Validates and parses session JWT and returns the OIDC user metadata.
 * If the session is invalid or expired, revokes the session and returns null.
 */
declare const getAuth: (c: Context) => Promise<OidcAuth | null>;
/**
 * Revokes the refresh token of the current session and deletes the session cookie
 */
declare const revokeSession: (c: Context) => Promise<void>;
/**
 * Processes the OAuth2 callback request.
 */
declare const processOAuthCallback: (c: Context) => Promise<Response>;
/**
 * Returns a middleware that requires OIDC authentication.
 */
declare const oidcAuthMiddleware: () => MiddlewareHandler;

export { type IDToken, type OidcAuth, type OidcClaimsHook, type TokenEndpointResponses, getAuth, getAuthorizationServer, getClient, oidcAuthMiddleware, processOAuthCallback, revokeSession };
