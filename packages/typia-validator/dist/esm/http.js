import { validator } from 'hono/validator';
export const typiaValidator = (target, validate, hook) => {
    if (target === 'query' || target === 'header') {
        return async (c, next) => {
            let value;
            if (target === 'query') {
                const queries = c.req.queries();
                value = {
                    get: (key) => queries[key]?.[0] ?? null,
                    getAll: (key) => queries[key] ?? [],
                };
            }
            else {
                value = Object.create(null);
                for (const [key, headerValue] of c.req.raw.headers) {
                    value[key.toLowerCase()] = headerValue;
                }
                if (c.req.raw.headers.has('Set-Cookie')) {
                    value['Set-Cookie'] = c.req.raw.headers.getSetCookie();
                }
            }
            const result = validate(value);
            if (hook) {
                const res = await hook(result, c);
                if (res instanceof Response) {
                    return res;
                }
            }
            if (!result.success) {
                return c.json({ success: false, error: result.errors }, 400);
            }
            c.req.addValidatedData(target, result.data);
            await next();
        };
    }
    return validator(target, async (value, c) => {
        const result = validate(value);
        if (hook) {
            const hookResult = await hook({ ...result, data: value }, c);
            if (hookResult) {
                if (hookResult instanceof Response || hookResult instanceof Promise) {
                    return hookResult;
                }
                if ('response' in hookResult) {
                    return hookResult.response;
                }
            }
        }
        if (!result.success) {
            return c.json({ success: false, error: result.errors }, 400);
        }
        return result.data;
    });
};
