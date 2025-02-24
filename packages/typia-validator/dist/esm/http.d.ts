import type { Context, MiddlewareHandler, Env, ValidationTargets, TypedResponse } from 'hono';
import type { IValidation } from 'typia';
interface IFailure<T> {
    success: false;
    errors: IValidation.IError[];
    data: T;
}
type BaseType<T> = T extends string ? string : T extends number ? number : T extends boolean ? boolean : T extends symbol ? symbol : T extends bigint ? bigint : T;
type Parsed<T> = T extends Record<string | number, any> ? {
    [K in keyof T]-?: T[K] extends (infer U)[] ? (BaseType<U> | null | undefined)[] | undefined : BaseType<T[K]> | null | undefined;
} : BaseType<T>;
export type QueryValidation<O extends Record<string | number, any> = any> = (input: string | URLSearchParams) => IValidation<O>;
export type QueryOutputType<T> = T extends QueryValidation<infer O> ? O : never;
type QueryStringify<T> = T extends Record<string | number, any> ? {
    [K in keyof T]: [T[K]] extends [bigint | number | boolean] ? `${T[K]}` : T[K] extends (infer U)[] ? [U] extends [bigint | number | boolean] ? `${U}`[] : T[K] : T[K];
} : T;
export type HeaderValidation<O extends Record<string | number, any> = any> = (input: Record<string, string | string[] | undefined>) => IValidation<O>;
export type HeaderOutputType<T> = T extends HeaderValidation<infer O> ? O : never;
type HeaderStringify<T> = T extends Record<string | number, any> ? {
    [K in keyof T]: [T[K]] extends [bigint | number | boolean] ? `${T[K]}` : T[K] extends (infer U)[] ? [U] extends [bigint | number | boolean] ? `${U}` : U : T[K];
} : T;
export type HttpHook<T, E extends Env, P extends string, O = {}> = (result: IValidation.ISuccess<T> | IFailure<Parsed<T>>, c: Context<E, P>) => Response | Promise<Response> | void | Promise<Response | void> | TypedResponse<O>;
export type Hook<T, E extends Env, P extends string, O = {}> = (result: IValidation.ISuccess<T> | IFailure<T>, c: Context<E, P>) => Response | Promise<Response> | void | Promise<Response | void> | TypedResponse<O>;
export type Validation<O = any> = (input: unknown) => IValidation<O>;
export type OutputType<T> = T extends Validation<infer O> ? O : never;
interface TypiaValidator {
    <T extends QueryValidation, O extends QueryOutputType<T>, E extends Env, P extends string, V extends {
        in: {
            query: QueryStringify<O>;
        };
        out: {
            query: O;
        };
    } = {
        in: {
            query: QueryStringify<O>;
        };
        out: {
            query: O;
        };
    }>(target: 'query', validate: T, hook?: HttpHook<O, E, P>): MiddlewareHandler<E, P, V>;
    <T extends HeaderValidation, O extends HeaderOutputType<T>, E extends Env, P extends string, V extends {
        in: {
            header: HeaderStringify<O>;
        };
        out: {
            header: O;
        };
    } = {
        in: {
            header: HeaderStringify<O>;
        };
        out: {
            header: O;
        };
    }>(target: 'header', validate: T, hook?: HttpHook<O, E, P>): MiddlewareHandler<E, P, V>;
    <T extends Validation, O extends OutputType<T>, Target extends Exclude<keyof ValidationTargets, 'query' | 'queries' | 'header'>, E extends Env, P extends string, V extends {
        in: {
            [K in Target]: O;
        };
        out: {
            [K in Target]: O;
        };
    } = {
        in: {
            [K in Target]: O;
        };
        out: {
            [K in Target]: O;
        };
    }>(target: Target, validate: T, hook?: Hook<O, E, P>): MiddlewareHandler<E, P, V>;
}
export declare const typiaValidator: TypiaValidator;
export {};
