import type { TSchema, Static } from '@sinclair/typebox';
import type { ValueError } from '@sinclair/typebox/value';
import type { Context, Env, MiddlewareHandler, ValidationTargets } from 'hono';
export type Hook<T, E extends Env, P extends string> = (result: {
    success: true;
    data: T;
} | {
    success: false;
    errors: ValueError[];
}, c: Context<E, P>) => Response | Promise<Response> | void;
/**
 * Hono middleware that validates incoming data via a [TypeBox](https://github.com/sinclairzx81/typebox) schema.
 *
 * ---
 *
 * No Hook
 *
 * ```ts
 * import { tbValidator } from '@hono/typebox-validator'
 * import { Type as T } from '@sinclair/typebox'
 *
 * const schema = T.Object({
 *   name: T.String(),
 *   age: T.Number(),
 * })
 *
 * const route = app.post('/user', tbValidator('json', schema), (c) => {
 *   const user = c.req.valid('json')
 *   return c.json({ success: true, message: `${user.name} is ${user.age}` })
 * })
 * ```
 *
 * ---
 * Hook
 *
 * ```ts
 * import { tbValidator } from '@hono/typebox-validator'
 * import { Type as T } from '@sinclair/typebox'
 *
 * const schema = T.Object({
 *   name: T.String(),
 *   age: T.Number(),
 * })
 *
 * app.post(
 *   '/user',
 *   tbValidator('json', schema, (result, c) => {
 *     if (!result.success) {
 *       return c.text('Invalid!', 400)
 *     }
 *   })
 *   //...
 * )
 * ```
 */
export declare function tbValidator<T extends TSchema, Target extends keyof ValidationTargets, E extends Env, P extends string, V extends {
    in: {
        [K in Target]: Static<T>;
    };
    out: {
        [K in Target]: Static<T>;
    };
}>(target: Target, schema: T, hook?: Hook<Static<T>, E, P>, stripNonSchemaItems?: boolean): MiddlewareHandler<E, P, V>;
