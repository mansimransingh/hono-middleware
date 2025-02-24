// src/index.ts
import { createMiddleware } from "hono/factory";
import { Registry, collectDefaultMetrics as promCollectDefaultMetrics } from "prom-client";

// src/standardMetrics.ts
import { Counter, Histogram } from "prom-client";
var standardMetrics = {
  requestDuration: {
    type: "histogram",
    name: "http_request_duration_seconds",
    help: "Duration of HTTP requests in seconds",
    labelNames: ["method", "status", "ok", "route"],
    // OpenTelemetry recommendation for histogram buckets of http request duration:
    // https://opentelemetry.io/docs/specs/semconv/http/http-metrics/#metric-httpserverrequestduration
    buckets: [5e-3, 0.01, 0.025, 0.05, 0.075, 0.1, 0.25, 0.5, 0.75, 1, 2.5, 5, 7.5, 10]
  },
  requestsTotal: {
    type: "counter",
    name: "http_requests_total",
    help: "Total number of HTTP requests",
    labelNames: ["method", "status", "ok", "route"]
  }
};
var getMetricConstructor = (type) => ({
  counter: Counter,
  histogram: Histogram
})[type];
var createStandardMetrics = ({
  registry,
  prefix = "",
  customOptions
}) => {
  const createdMetrics = {};
  for (const [metric, options] of Object.entries(standardMetrics)) {
    const opts = {
      ...options,
      ...customOptions?.[metric]
    };
    if (opts.disabled) {
      continue;
    }
    const MetricConstructor = getMetricConstructor(opts.type);
    createdMetrics[metric] = new MetricConstructor({
      ...opts,
      name: `${prefix}${opts.name}`,
      help: opts.help,
      registers: [...opts.registers ?? [], registry],
      labelNames: [...opts.labelNames ?? [], ...Object.keys(opts.customLabels ?? {})],
      ...opts.type === "histogram" && opts.buckets && {
        buckets: opts.buckets
      }
    });
  }
  return createdMetrics;
};

// src/index.ts
var evaluateCustomLabels = (customLabels, context) => {
  const labels = {};
  for (const [key, fn] of Object.entries(customLabels ?? {})) {
    labels[key] = fn(context);
  }
  return labels;
};
var prometheus = (options) => {
  const {
    registry = new Registry(),
    collectDefaultMetrics = false,
    prefix = "",
    metricOptions
  } = options ?? {};
  if (collectDefaultMetrics) {
    promCollectDefaultMetrics({
      prefix,
      register: registry,
      ...typeof collectDefaultMetrics === "object" && collectDefaultMetrics
    });
  }
  const metrics = createStandardMetrics({
    prefix,
    registry,
    customOptions: metricOptions
  });
  return {
    printMetrics: async (c) => c.text(await registry.metrics()),
    registerMetrics: createMiddleware(async (c, next) => {
      const timer = metrics.requestDuration?.startTimer();
      try {
        await next();
      } finally {
        const commonLabels = {
          method: c.req.method,
          route: c.req.routePath,
          status: c.res.status.toString(),
          ok: String(c.res.ok)
        };
        timer?.({
          ...commonLabels,
          ...evaluateCustomLabels(metricOptions?.requestDuration?.customLabels, c)
        });
        metrics.requestsTotal?.inc({
          ...commonLabels,
          ...evaluateCustomLabels(metricOptions?.requestsTotal?.customLabels, c)
        });
      }
    })
  };
};
export {
  prometheus
};
