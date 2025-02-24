import type { Result, Router } from 'hono/dist/types/router';
export declare class MedleyRouter<T> implements Router<T> {
    router: any;
    name: string;
    constructor();
    add(method: string, path: string, handler: T): void;
    match(method: string, path: string): Result<T>;
}
