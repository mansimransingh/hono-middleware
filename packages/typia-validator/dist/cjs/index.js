"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.typiaValidator = void 0;
const validator_1 = require("hono/validator");
const typiaValidator = (target, validate, hook) => (0, validator_1.validator)(target, async (value, c) => {
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
exports.typiaValidator = typiaValidator;
