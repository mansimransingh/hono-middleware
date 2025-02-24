import { ValueGuard } from '@sinclair/typebox';
import { Value } from '@sinclair/typebox/value';
import { validator } from 'hono/validator';
var IsObject = ValueGuard.IsObject;
var IsArray = ValueGuard.IsArray;
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
export function tbValidator(target, schema, hook, stripNonSchemaItems) {
    // Compile the provided schema once rather than per validation. This could be optimized further using a shared schema
    // compilation pool similar to the Fastify implementation.
    return validator(target, (unprocessedData, c) => {
        const data = stripNonSchemaItems
            ? removeNonSchemaItems(schema, unprocessedData)
            : unprocessedData;
        if (Value.Check(schema, data)) {
            if (hook) {
                const hookResult = hook({ success: true, data }, c);
                if (hookResult instanceof Response || hookResult instanceof Promise) {
                    return hookResult;
                }
            }
            return data;
        }
        const errors = Array.from(Value.Errors(schema, data));
        if (hook) {
            const hookResult = hook({ success: false, errors }, c);
            if (hookResult instanceof Response || hookResult instanceof Promise) {
                return hookResult;
            }
        }
        return c.json({ success: false, errors }, 400);
    });
}
function removeNonSchemaItems(schema, obj) {
    if (typeof obj !== 'object' || obj === null) {
        return obj;
    }
    if (Array.isArray(obj)) {
        return obj.map((item) => removeNonSchemaItems(schema.items, item));
    }
    const result = {};
    for (const key in schema.properties) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const propertySchema = schema.properties[key];
            if (IsObject(propertySchema) && !IsArray(propertySchema)) {
                result[key] = removeNonSchemaItems(propertySchema, obj[key]);
            }
            else {
                result[key] = obj[key];
            }
        }
    }
    return result;
}
