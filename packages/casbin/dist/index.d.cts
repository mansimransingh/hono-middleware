import { Enforcer } from 'casbin';
import { MiddlewareHandler, Context } from 'hono';

interface CasbinOptions {
    newEnforcer: Promise<Enforcer>;
    authorizer: (c: Context, enforcer: Enforcer) => Promise<boolean>;
}
declare const casbin: (opt: CasbinOptions) => MiddlewareHandler;

export { casbin };
