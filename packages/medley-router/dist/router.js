"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MedleyRouter = void 0;
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const router_1 = __importDefault(require("@medley/router"));
class MedleyRouter {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    router;
    name = 'MedleyRouter';
    constructor() {
        this.router = new router_1.default();
    }
    add(method, path, handler) {
        const store = this.router.register(path);
        store[method] = handler;
    }
    match(method, path) {
        const route = this.router.find(path);
        if (route) {
            return [[[route['store'][method]], route['params']]];
        }
        return [[], []];
    }
}
exports.MedleyRouter = MedleyRouter;
