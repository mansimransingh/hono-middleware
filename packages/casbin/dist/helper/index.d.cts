import { Enforcer } from 'casbin';
import { Context } from 'hono';

declare const jwtAuthorizer: (c: Context, enforcer: Enforcer, claimMapping?: Record<string, string>) => Promise<boolean>;

declare const basicAuthorizer: (c: Context, enforcer: Enforcer) => Promise<boolean>;

export { basicAuthorizer, jwtAuthorizer };
