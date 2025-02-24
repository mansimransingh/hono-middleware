import * as hono from 'hono';
import { Context } from 'hono';
import { CounterConfiguration, HistogramConfiguration, Registry, DefaultMetricsCollectorConfiguration, RegistryContentType } from 'prom-client';

type MetricOptions = {
    disabled?: boolean;
    customLabels?: Record<string, (c: Context) => string>;
} & (({
    type: 'counter';
} & CounterConfiguration<string>) | ({
    type: 'histogram';
} & HistogramConfiguration<string>));
declare const standardMetrics: {
    requestDuration: {
        type: "histogram";
        name: string;
        help: string;
        labelNames: string[];
        buckets: number[];
    };
    requestsTotal: {
        type: "counter";
        name: string;
        help: string;
        labelNames: string[];
    };
};
type MetricName = keyof typeof standardMetrics;
type CustomMetricsOptions = {
    [Name in MetricName]?: Partial<Omit<MetricOptions, 'type' | 'collect' | 'labelNames'>>;
};

interface PrometheusOptions {
    registry?: Registry;
    collectDefaultMetrics?: boolean | DefaultMetricsCollectorConfiguration<RegistryContentType>;
    prefix?: string;
    metricOptions?: Omit<CustomMetricsOptions, 'prefix' | 'register'>;
}
declare const prometheus: (options?: PrometheusOptions) => {
    printMetrics: (c: Context) => Promise<Response>;
    registerMetrics: hono.MiddlewareHandler<any, any, {}>;
};

export { prometheus };
