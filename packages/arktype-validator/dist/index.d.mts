import { ArkErrors, Type } from 'arktype';
import { Env, Context, TypedResponse, ValidationTargets, MiddlewareHandler } from 'hono';

type Hook<T, E extends Env, P extends string, O = {}> = (result: {
    success: false;
    data: unknown;
    errors: ArkErrors;
} | {
    success: true;
    data: T;
}, c: Context<E, P>) => Response | Promise<Response> | void | Promise<Response | void> | TypedResponse<O>;
type HasUndefined<T> = undefined extends T ? true : false;
declare const arktypeValidator: <T extends Type<unknown, any>, Target extends keyof ValidationTargets, E extends Env, P extends string, I = T["inferIn"], O = T["infer"], V extends {
    in: HasUndefined<I> extends true ? { [K in Target]?: I | undefined; } : { [K_1 in Target]: I; };
    out: { [K_2 in Target]: O; };
} = {
    in: HasUndefined<I> extends true ? { [K_3 in Target]?: I | undefined; } : { [K_4 in Target]: I; };
    out: { [K_5 in Target]: O; };
}>(target: Target, schema: T, hook?: Hook<T["infer"], E, P, {}> | undefined) => MiddlewareHandler<E, P, V>;

export { type Hook, arktypeValidator };
