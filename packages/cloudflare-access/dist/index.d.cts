import * as hono from 'hono';

type CloudflareAccessPayload = {
    aud: string[];
    email: string;
    exp: number;
    iat: number;
    nbf: number;
    iss: string;
    type: string;
    identity_nonce: string;
    sub: string;
    country: string;
};
type CloudflareAccessVariables = {
    accessPayload: CloudflareAccessPayload;
};
declare module 'hono' {
    interface ContextVariableMap {
        accessPayload: CloudflareAccessPayload;
    }
}
declare const cloudflareAccess: (accessTeamName: string) => hono.MiddlewareHandler<any, any, {}>;

export { type CloudflareAccessPayload, type CloudflareAccessVariables, cloudflareAccess };
