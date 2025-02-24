import { GraphQLError } from 'graphql';
import type { GraphQLSchema, ValidationRule, GraphQLFormattedError } from 'graphql';
import type { Context, Env, Input, MiddlewareHandler } from 'hono';
export type RootResolver<E extends Env = any, P extends string = any, I extends Input = {}> = (c: Context<E, P, I>) => Promise<unknown> | unknown;
type Options<E extends Env = any, P extends string = any, I extends Input = {}> = {
    schema: GraphQLSchema;
    rootResolver?: RootResolver<E, P, I>;
    pretty?: boolean;
    validationRules?: ReadonlyArray<ValidationRule>;
    graphiql?: boolean;
};
export declare const graphqlServer: <E extends Env = any, P extends string = any, I extends Input = {}>(options: Options<E, P, I>) => MiddlewareHandler;
export interface GraphQLParams {
    query: string | null;
    variables: {
        readonly [name: string]: unknown;
    } | null;
    operationName: string | null;
    raw: boolean;
}
export declare const getGraphQLParams: (request: Request) => Promise<GraphQLParams>;
export declare const errorMessages: (messages: string[], graphqlErrors?: readonly GraphQLError[] | readonly GraphQLFormattedError[]) => {
    errors: readonly GraphQLError[] | readonly GraphQLFormattedError[];
} | {
    errors: {
        message: string;
    }[];
};
export declare const respondWithGraphiQL: (c: Context) => Response | Promise<Response>;
export {};
