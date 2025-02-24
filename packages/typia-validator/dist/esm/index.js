import { validator } from 'hono/validator';
export const typiaValidator = (target, validate, hook) => validator(target, async (value, c) => {
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
