import { Schema } from 'effect';
import { ValidationTargets, Env, Input, MiddlewareHandler } from 'hono';

type HasUndefined<T> = undefined extends T ? true : false;
declare const effectValidator: <Target extends keyof ValidationTargets, E extends Env, P extends string, Type, Encoded, In = { [KeyType in keyof Encoded]: Encoded[KeyType]; }, Out = { [KeyType_1 in keyof Type]: Type[KeyType_1]; }, I extends Input = {
    in: HasUndefined<In> extends true ? { [K in Target]?: K extends "json" ? In : HasUndefined<keyof ValidationTargets[K]> extends true ? { [K2 in keyof In]?: ValidationTargets[K][K2]; } : { [K2 in keyof In]: ValidationTargets[K][K2]; }; } : { [K in Target]: K extends "json" ? In : HasUndefined<keyof ValidationTargets[K]> extends true ? { [K2 in keyof In]?: ValidationTargets[K][K2]; } : { [K2 in keyof In]: ValidationTargets[K][K2]; }; };
    out: { [K in Target]: Out; };
}>(target: Target, schema: Schema.Schema<Type, Encoded, never>) => MiddlewareHandler<E, P, I>;

export { effectValidator };
