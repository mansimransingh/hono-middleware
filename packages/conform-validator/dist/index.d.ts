import * as hono_types from 'hono/types';
import { Submission } from '@conform-to/dom';
import { Env, Input, MiddlewareHandler, Context } from 'hono';

type GetInput<T extends ParseFn> = T extends (_: any) => infer S ? Awaited<S> extends Submission<any, any, infer V> ? V : never : never;
type GetSuccessSubmission<S> = S extends {
    status: 'success';
} ? S : never;
type ParseFn = (formData: FormData) => Submission<unknown> | Promise<Submission<unknown>>;
type Hook<F extends ParseFn, E extends Env, P extends string> = (submission: Awaited<ReturnType<F>>, c: Context<E, P>) => Response | Promise<Response> | void | Promise<Response | void>;
declare const conformValidator: <F extends ParseFn, E extends Env, P extends string, In = GetInput<F>, Out = Awaited<ReturnType<F>>, I extends Input = {
    in: {
        form: { [K in keyof In]: hono_types.ParsedFormValue | hono_types.ParsedFormValue[]; };
    };
    out: {
        form: GetSuccessSubmission<Out>;
    };
}>(parse: F, hook?: Hook<F, E, P> | undefined) => MiddlewareHandler<E, P, I>;

export { conformValidator };
