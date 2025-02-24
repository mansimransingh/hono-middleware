import { MiddlewareHandler } from 'hono';
import { InjectionToken, DependencyContainer } from 'tsyringe';

declare module 'hono' {
    interface ContextVariableMap {
        resolve: <T>(token: InjectionToken<T>) => T;
    }
}
type Provider = (container: DependencyContainer) => void;
declare const tsyringe: (...providers: Provider[]) => MiddlewareHandler;

export { type Provider, tsyringe };
