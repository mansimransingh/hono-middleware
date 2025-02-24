import type { Context, MiddlewareHandler, Env, ValidationTargets, TypedResponse } from 'hono';
import type { IValidation } from 'typia';
export type Hook<T, E extends Env, P extends string, O = {}> = (result: IValidation.ISuccess<T> | {
    success: false;
    errors: IValidation.IError[];
    data: T;
}, c: Context<E, P>) => Response | Promise<Response> | void | Promise<Response | void> | TypedResponse<O>;
export type Validation<O = any> = (input: unknown) => IValidation<O>;
export type OutputType<T> = T extends Validation<infer O> ? O : never;
export declare const typiaValidator: <T extends Validation, O extends OutputType<T>, Target extends keyof ValidationTargets, E extends Env, P extends string, V extends {
    in: { [K in Target]: O; };
    out: { [K in Target]: O; };
} = {
    in: { [K in Target]: O; };
    out: { [K in Target]: O; };
}>(target: Target, validate: T, hook?: Hook<O, E, P>) => MiddlewareHandler<E, P, V>;
