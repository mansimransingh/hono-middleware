"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hono_1 = require("hono");
const src_1 = require("../src");
describe('Basic', () => {
    const app = new hono_1.Hono({ router: new src_1.MedleyRouter() });
    app.get('/', (c) => c.text('Hello'));
    it('Should return a 200 response', async () => {
        const res = await app.request('/');
        expect(res).not.toBeNull();
        expect(res.status).toBe(200);
    });
});
