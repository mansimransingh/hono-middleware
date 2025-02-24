"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  prometheus: () => prometheus
});
module.exports = __toCommonJS(src_exports);
var import_factory = require("hono/factory");
var import_prom_client2 = require("prom-client");

// src/standardMetrics.ts
var import_prom_client = require("prom-client");
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
  counter: import_prom_client.Counter,
  histogram: import_prom_client.Histogram
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
    registry = new import_prom_client2.Registry(),
    collectDefaultMetrics = false,
    prefix = "",
    metricOptions
  } = options ?? {};
  if (collectDefaultMetrics) {
    (0, import_prom_client2.collectDefaultMetrics)({
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
    registerMetrics: (0, import_factory.createMiddleware)(async (c, next) => {
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  prometheus
});
