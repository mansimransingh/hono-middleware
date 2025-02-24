import { ClassConstructor, ClassTransformOptions } from 'class-transformer';
import { ValidationError } from 'class-validator';
import { ValidationTargets, Env, Input, MiddlewareHandler, Context, TypedResponse } from 'hono';

/**
 * Hono middleware that validates incoming data using class-validator(https://github.com/typestack/class-validator).
 *
 * ---
 *
 * No Hook
 *
 * ```ts
 * import { classValidator } from '@hono/class-validator'
 * import { IsInt, IsString } from 'class-validator'
 *
 * class CreateUserDto {
 *  @IsString()
 *  name!: string;
 *
 *  @IsInt()
 *  age!: number;
 * }
 *
 *
 * const route = app.post('/user', classValidator('json', CreateUserDto), (c) => {
 *   const user = c.req.valid('json')
 *   return c.json({ success: true, message: `${user.name} is ${user.age}` })
 * })
 * ```
 *
 * ---
 * Hook
 *
 * ```ts
 * import { classValidator } from '@hono/class-validator'
 * import { IsInt, IsString } from 'class-validator'
 *
 * class CreateUserDto {
 *  @IsString()
 *  name!: string;
 *
 *  @IsInt()
 *  age!: number;
 * }
 *
 * app.post(
 *   '/user',
 *   classValidator('json', CreateUserDto, (result, c) => {
 *     if (!result.success) {
 *       return c.text('Invalid!', 400)
 *     }
 *   })
 *   //...
 * )
 * ```
 */
type Hook<T, E extends Env, P extends string, Target extends keyof ValidationTargets = keyof ValidationTargets, O = object> = (result: ({
    success: true;
} | {
    success: false;
    errors: ValidationError[];
}) & {
    data: T;
    target: Target;
}, c: Context<E, P>) => Response | void | TypedResponse<O> | Promise<Response | void | TypedResponse<O>>;
type HasUndefined<T> = undefined extends T ? true : false;
type HasClassConstructor<T> = ClassConstructor<any> extends T ? true : false;
type StaticObject<T extends ClassConstructor<any>> = {
    [K in keyof InstanceType<T>]: HasClassConstructor<InstanceType<T>[K]> extends true ? StaticObject<InstanceType<T>[K]> : InstanceType<T>[K];
};
declare const classValidator: <T extends ClassConstructor<any>, Output extends InstanceType<T> = InstanceType<T>, Target extends keyof ValidationTargets = keyof ValidationTargets, E extends Env = Env, P extends string = string, In = StaticObject<T>, I extends Input = {
    in: HasUndefined<In> extends true ? { [K in Target]?: (K extends "json" ? In : HasUndefined<keyof ValidationTargets[K]> extends true ? { [K2 in keyof In]?: ValidationTargets[K][K2] | undefined; } : { [K2_1 in keyof In]: ValidationTargets[K][K2_1]; }) | undefined; } : { [K_1 in Target]: K_1 extends "json" ? In : HasUndefined<keyof ValidationTargets[K_1]> extends true ? { [K2_2 in keyof In]?: ValidationTargets[K_1][K2_2] | undefined; } : { [K2_3 in keyof In]: ValidationTargets[K_1][K2_3]; }; };
    out: { [K_2 in Target]: Output; };
}, V extends I = I>(target: Target, dataType: T, hook?: Hook<Output, E, P, Target, object> | undefined, options?: ClassTransformOptions) => MiddlewareHandler<E, P, V>;

export { type StaticObject, classValidator };
