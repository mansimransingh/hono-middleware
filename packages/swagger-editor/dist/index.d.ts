import { Context } from 'hono';

interface CustomSwaggerUIOptions {
    /**
     * URL to fetch external configuration document from.
     */
    configUrl?: string | undefined;
    /**
     * A JavaScript object describing the OpenAPI definition. When used, the url parameter will not be parsed. This is useful for testing manually-generated definitions without hosting them
     */
    spec?: {
        [propName: string]: any;
    } | undefined;
    /**
     * The URL pointing to API definition (normally swagger.json or swagger.yaml). Will be ignored if urls or spec is used.
     */
    url?: string | undefined;
    /**
     * The name of a component available via the plugin system to use as the top-level layout
     * for Swagger UI.
     */
    layout?: string | undefined;
    /**
     * A Javascript object to configure plugin integration and behaviors
     */
    pluginsOptions?: PluginsOptions;
    /**
     * An array of plugin functions to use in Swagger UI.
     */
    plugins?: SwaggerUIPlugin[] | undefined;
    /**
     * An array of presets to use in Swagger UI.
     * Usually, you'll want to include ApisPreset if you use this option.
     */
    presets?: SwaggerUIPlugin[] | undefined;
    /**
     * If set to true, enables deep linking for tags and operations.
     * See the Deep Linking documentation for more information.
     */
    deepLinking?: boolean | undefined;
    /**
     * Controls the display of operationId in operations list. The default is false.
     */
    displayOperationId?: boolean | undefined;
    /**
     * The default expansion depth for models (set to -1 completely hide the models).
     */
    defaultModelsExpandDepth?: number | undefined;
    /**
     * The default expansion depth for the model on the model-example section.
     */
    defaultModelExpandDepth?: number | undefined;
    /**
     * Controls how the model is shown when the API is first rendered.
     * (The user can always switch the rendering for a given model by clicking the
     * 'Model' and 'Example Value' links.)
     */
    defaultModelRendering?: 'example' | 'model' | undefined;
    /**
     * Controls the display of the request duration (in milliseconds) for "Try it out" requests.
     */
    displayRequestDuration?: boolean | undefined;
    /**
     * Controls the default expansion setting for the operations and tags.
     * It can be 'list' (expands only the tags), 'full' (expands the tags and operations)
     * or 'none' (expands nothing).
     */
    docExpansion?: 'list' | 'full' | 'none' | undefined;
    /**
     * If set, enables filtering.
     * The top bar will show an edit box that you can use to filter the tagged operations that are shown.
     * Can be Boolean to enable or disable, or a string, in which case filtering will be enabled
     * using that string as the filter expression.
     * Filtering is case sensitive matching the filter expression anywhere inside the tag.
     */
    filter?: boolean | string | undefined;
    /**
     * If set, limits the number of tagged operations displayed to at most this many.
     * The default is to show all operations.
     */
    maxDisplayedTags?: number | undefined;
    /**
     * Apply a sort to the operation list of each API.
     * It can be 'alpha' (sort by paths alphanumerically),
     * 'method' (sort by HTTP method) or a function (see Array.prototype.sort() to know how sort function works).
     * Default is the order returned by the server unchanged.
     */
    operationsSorter?: SorterLike | undefined;
    /**
     * Controls the display of vendor extension (x-) fields and values for Operations,
     * Parameters, Responses, and Schema.
     */
    showExtensions?: boolean | undefined;
    /**
     * Controls the display of extensions (pattern, maxLength, minLength, maximum, minimum) fields
     * and values for Parameters.
     */
    showCommonExtensions?: boolean | undefined;
    /**
     * Apply a sort to the tag list of each API.
     * It can be 'alpha' (sort by paths alphanumerically)
     * or a function (see Array.prototype.sort() to learn how to write a sort function).
     * Two tag name strings are passed to the sorter for each pass.
     * Default is the order determined by Swagger UI.
     */
    tagsSorter?: SorterLike | undefined;
    /**
     * When enabled, sanitizer will leave style, class and data-* attributes untouched
     * on all HTML Elements declared inside markdown strings.
     * This parameter is Deprecated and will be removed in 4.0.0.
     * @deprecated
     */
    useUnsafeMarkdown?: boolean | undefined;
    /**
     * Provides a mechanism to be notified when Swagger UI has finished rendering a newly provided definition.
     */
    onComplete?: (() => any) | undefined;
    /**
     * Set to false to deactivate syntax highlighting of payloads and cURL command,
     * can be otherwise an object with the activate and theme properties.
     */
    syntaxHighlight?: false | {
        /**
         * Whether syntax highlighting should be activated or not.
         */
        activate?: boolean | undefined;
        /**
         * Highlight.js syntax coloring theme to use. (Only these 6 styles are available.)
         */
        theme?: 'agate' | 'arta' | 'idea' | 'monokai' | 'nord' | 'obsidian' | 'tomorrow-night' | undefined;
    } | undefined;
    /**
     * Controls whether the "Try it out" section should be enabled by default.
     */
    tryItOutEnabled?: boolean | undefined;
    /**
     * This is the default configuration section for the the requestSnippets plugin.
     */
    requestSnippets?: {
        generators?: {
            [genName: string]: {
                title: string;
                syntax: string;
            };
        } | undefined;
        defaultExpanded?: boolean | undefined;
        /**
         * e.g. only show curl bash = ["curl_bash"]
         */
        languagesMask?: string[] | undefined;
    } | undefined;
    /**
     * OAuth redirect URL.
     */
    oauth2RedirectUrl?: string | undefined;
    /**
     * MUST be a function. Function to intercept remote definition,
     * "Try it out", and OAuth 2.0 requests.
     * Accepts one argument requestInterceptor(request) and must return the modified request,
     * or a Promise that resolves to the modified request.
     */
    requestInterceptor?: ((a: Request) => Request | Promise<Request>) | undefined;
    /**
     * MUST be a function. Function to intercept remote definition,
     * "Try it out", and OAuth 2.0 responses.
     * Accepts one argument responseInterceptor(response) and must return the modified response,
     * or a Promise that resolves to the modified response.
     */
    responseInterceptor?: ((a: Response$1) => Response$1 | Promise<Response$1>) | undefined;
    /**
     * If set to true, uses the mutated request returned from a requestInterceptor
     * to produce the curl command in the UI, otherwise the request
     * beforethe requestInterceptor was applied is used.
     */
    showMutatedRequest?: boolean | undefined;
    /**
     * List of HTTP methods that have the "Try it out" feature enabled.
     * An empty array disables "Try it out" for all operations.
     * This does not filter the operations from the display.
     */
    supportedSubmitMethods?: SupportedHTTPMethods[] | undefined;
    /**
     * By default, Swagger UI attempts to validate specs against swagger.io's online validator.
     * You can use this parameter to set a different validator URL,
     * for example for locally deployed validators (Validator Badge).
     * Setting it to either none, 127.0.0.1 or localhost will disable validation.
     */
    validatorUrl?: string | undefined;
    /**
     * If set to true, enables passing credentials, as defined in the Fetch standard,
     * in CORS requests that are sent by the browser.
     * Note that Swagger UI cannot currently set cookies cross-domain (see swagger-js#1163)
     * - as a result, you will have to rely on browser-supplied
     * cookies (which this setting enables sending) that Swagger UI cannot control.
     */
    withCredentials?: boolean | undefined;
    /**
     * Function to set default values to each property in model.
     * Accepts one argument modelPropertyMacro(property), property is immutable
     */
    modelPropertyMacro?: ((propName: Readonly<any>) => any) | undefined;
    /**
     * Function to set default value to parameters.
     * Accepts two arguments parameterMacro(operation, parameter).
     * Operation and parameter are objects passed for context, both remain immutable
     */
    parameterMacro?: ((operation: Readonly<any>, parameter: Readonly<any>) => any) | undefined;
    /**
     * If set to true, it persists authorization data and it would not be lost on browser close/refresh
     */
    persistAuthorization?: boolean | undefined;
}
interface PluginsOptions {
    /**
     * Control behavior of plugins when targeting the same component with wrapComponent.<br/>
     * - `legacy` (default) : last plugin takes precedence over the others<br/>
     * - `chain` : chain wrapComponents when targeting the same core component,
     *  allowing multiple plugins to wrap the same component
     * @default 'legacy'
     */
    pluginLoadType?: PluginLoadType;
}
type PluginLoadType = 'legacy' | 'chain';
type SupportedHTTPMethods = 'get' | 'put' | 'post' | 'delete' | 'options' | 'head' | 'patch' | 'trace';
type SorterLike = 'alpha' | 'method' | ((name1: string, name2: string) => number);
interface Request {
    [prop: string]: any;
}
interface Response$1 {
    [prop: string]: any;
}
/**
 * See https://swagger.io/docs/open-source-tools/swagger-ui/customization/plugin-api/
 */
type SwaggerUIPlugin = (system: any) => {
    statePlugins?: {
        [stateKey: string]: {
            actions?: Indexable | undefined;
            reducers?: Indexable | undefined;
            selectors?: Indexable | undefined;
            wrapActions?: Indexable | undefined;
            wrapSelectors?: Indexable | undefined;
        };
    } | undefined;
    components?: Indexable | undefined;
    wrapComponents?: Indexable | undefined;
    rootInjects?: Indexable | undefined;
    afterLoad?: ((system: any) => any) | undefined;
    fn?: Indexable | undefined;
};
interface Indexable {
    [index: string]: any;
}

declare const MODERN_NORMALIZE_CSS = "\n*,\n::before,\n::after {\n    box-sizing: border-box;\n}\n\nhtml {\n    font-family:\n        system-ui,\n        'Segoe UI',\n        Roboto,\n        Helvetica,\n        Arial,\n        sans-serif,\n        'Apple Color Emoji',\n        'Segoe UI Emoji';\n    line-height: 1.15; /* 1. Correct the line height in all browsers. */\n    -webkit-text-size-adjust: 100%; /* 2. Prevent adjustments of font size after orientation changes in iOS. */\n    tab-size: 4; /* 3. Use a more readable tab size (opinionated). */\n}\n\nbody {\n    margin: 0;\n}\n\nb,\nstrong {\n    font-weight: bolder;\n}\n\ncode,\nkbd,\nsamp,\npre {\n    font-family:\n        ui-monospace,\n        SFMono-Regular,\n        Consolas,\n        'Liberation Mono',\n        Menlo,\n        monospace; /* 1 */\n    font-size: 1em; /* 2 */\n}\n\nsmall {\n    font-size: 80%;\n}\n\nsub,\nsup {\n    font-size: 75%;\n    line-height: 0;\n    position: relative;\n    vertical-align: baseline;\n}\n\nsub {\n    bottom: -0.25em;\n}\n\nsup {\n    top: -0.5em;\n}\n\ntable {\n    border-color: currentcolor;\n}\n\nbutton,\ninput,\noptgroup,\nselect,\ntextarea {\n    font-family: inherit; /* 1 */\n    font-size: 100%; /* 1 */\n    line-height: 1.15; /* 1 */\n    margin: 0; /* 2 */\n}\n\nbutton,\n[type='button'],\n[type='reset'],\n[type='submit'] {\n    -webkit-appearance: button;\n}\n\nlegend {\n    padding: 0;\n}\n\nprogress {\n    vertical-align: baseline;\n}\n\n::-webkit-inner-spin-button,\n::-webkit-outer-spin-button {\n    height: auto;\n}\n\n[type='search'] {\n    -webkit-appearance: textfield; /* 1 */\n    outline-offset: -2px; /* 2 */\n}\n\n::-webkit-search-decoration {\n    -webkit-appearance: none;\n}\n\n::-webkit-file-upload-button {\n    -webkit-appearance: button; /* 1 */\n    font: inherit; /* 2 */\n}\n\nsummary {\n    display: list-item;\n}\n\n.Pane2 {\n    overflow-y: scroll;\n}\n";
interface SwaggerEditorOptions extends CustomSwaggerUIOptions {
    version?: string;
}
declare function swaggerEditor(options?: SwaggerEditorOptions): (c: Context) => Promise<Response>;

export { MODERN_NORMALIZE_CSS, SwaggerEditorOptions, swaggerEditor };
