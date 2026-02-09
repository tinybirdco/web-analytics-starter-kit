/**
 * Tinybird Web Vitals Definitions
 */

import {
  defineEndpoint,
  definePipe,
  node,
  t,
  p,
  type InferParams,
  type InferOutputRow,
} from "@tinybirdco/sdk";
import { dashboardToken } from "./tokens";

/**
 * Web vitals events - parsed web_vital events with metadata
 */
export const webVitalsEvents = definePipe("web_vitals_events", {
  description:
    "Parsed web_vital events with metadata lookup and metric extraction",
  tokens: [{ token: dashboardToken, scope: "READ" }],
  nodes: [
    node({
      name: "web_vitals_metadata",
      description: "Static metadata lookup for web vitals metrics",
      sql: `
        SELECT
            metric_name,
            excellent_threshold,
            good_threshold,
            units,
            description,
            thresholds_text
        FROM (
            SELECT 'LCP' as metric_name, 2500 as excellent_threshold, 4000 as good_threshold, 'ms' as units,
                   'Largest Contentful Paint - measures loading performance' as description,
                   'Excellent: ≤2500ms, Good: ≤4000ms, Poor: >4000ms' as thresholds_text
            UNION ALL
            SELECT 'TTFB' as metric_name, 500 as excellent_threshold, 1000 as good_threshold, 'ms' as units,
                   'Time to First Byte - measures server response time' as description,
                   'Excellent: ≤500ms, Good: ≤1000ms, Poor: >1000ms' as thresholds_text
            UNION ALL
            SELECT 'FCP' as metric_name, 1800 as excellent_threshold, 3000 as good_threshold, 'ms' as units,
                   'First Contentful Paint - measures time until first content' as description,
                   'Excellent: ≤1800ms, Good: ≤3000ms, Poor: >3000ms' as thresholds_text
            UNION ALL
            SELECT 'INP' as metric_name, 200 as excellent_threshold, 500 as good_threshold, 'ms' as units,
                   'Interaction to Next Paint - measures responsiveness' as description,
                   'Excellent: ≤200ms, Good: ≤500ms, Poor: >500ms' as thresholds_text
            UNION ALL
            SELECT 'CLS' as metric_name, 0.1 as excellent_threshold, 0.25 as good_threshold, 'score' as units,
                   'Cumulative Layout Shift - measures visual stability' as description,
                   'Excellent: ≤0.1, Good: ≤0.25, Poor: >0.25' as thresholds_text
        )
      `,
    }),
    node({
      name: "parsed_vitals",
      description: "Parse raw web_vital events",
      sql: `
        SELECT
            timestamp,
            action,
            version,
            coalesce(session_id, '0') as session_id,
            tenant_id,
            multiIf(domain != '', domain, current_domain != '', current_domain, domain_from_payload) as domain,
            if(domainWithoutWWW(href) = '' and href is not null and href != '', URLHierarchy(href)[1], domainWithoutWWW(href)) as current_domain,
            JSONExtractString(payload, 'name') as metric_name,
            JSONExtractFloat(payload, 'value') as value,
            JSONExtractFloat(payload, 'delta') as delta,
            JSONExtractString(payload, 'pathname') as pathname,
            JSONExtractString(payload, 'domain') as domain_from_payload,
            JSONExtractString(payload, 'href') as href
        FROM analytics_events
        WHERE action = 'web_vital'
            {% if defined(from_date) %}
            AND timestamp >= {{ Date(from_date, description="Starting date", required=False) }}
            {% end %}
            {% if defined(to_date) %}
            AND timestamp <= {{ Date(to_date, description="Finishing date", required=False) }}
            {% end %}
            AND JSONExtractString(payload, 'name') IN ('LCP', 'TTFB', 'FCP', 'INP', 'CLS')
            AND JSONExtractString(payload, 'pathname') != ''
            AND JSONExtractFloat(payload, 'value') > 0
            AND JSONExtractFloat(payload, 'value') < 60000
            AND (
                (JSONExtractString(payload, 'name') = 'LCP' AND JSONExtractFloat(payload, 'value') < 30000) OR
                (JSONExtractString(payload, 'name') = 'TTFB' AND JSONExtractFloat(payload, 'value') < 30000) OR
                (JSONExtractString(payload, 'name') = 'FCP' AND JSONExtractFloat(payload, 'value') < 30000) OR
                (JSONExtractString(payload, 'name') = 'INP' AND JSONExtractFloat(payload, 'value') < 10000) OR
                (JSONExtractString(payload, 'name') = 'CLS' AND JSONExtractFloat(payload, 'value') < 1)
            )
            {% if defined(tenant_id) %}
            AND tenant_id = {{ String(tenant_id, description="Filter by tenant ID") }}
            {% end %}
            {% if defined(domain) %}
            AND domain = {{ String(domain, description="Filter by domain") }}
            {% end %}
      `,
    }),
    node({
      name: "endpoint",
      description: "Enrich web vitals data with computed fields",
      sql: `
        SELECT
            pv.timestamp,
            pv.action,
            pv.version,
            pv.session_id,
            pv.tenant_id,
            pv.domain,
            pv.metric_name,
            pv.value,
            pv.delta,
            pv.pathname,
            pv.href,
            if(pv.pathname = '/', '/', splitByChar('/', pv.pathname)[2]) as route,
            CASE
                WHEN pv.value <= md.excellent_threshold THEN 'excellent'
                WHEN pv.value <= md.good_threshold THEN 'good'
                ELSE 'poor'
            END as performance_category,
            CASE
                WHEN pv.value <= md.excellent_threshold THEN 100
                WHEN pv.value <= md.good_threshold THEN 75
                ELSE 25
            END as score,
            md.units,
            md.description,
            md.thresholds_text,
            CASE
                WHEN pv.value <= md.excellent_threshold THEN 'Excellent'
                WHEN pv.value <= md.good_threshold THEN 'Good'
                ELSE 'Poor'
            END as status
        FROM parsed_vitals pv
        INNER JOIN web_vitals_metadata md ON pv.metric_name = md.metric_name
      `,
    }),
  ],
});

/**
 * Web vitals current - current metrics with scores
 */
export const webVitalsCurrent = defineEndpoint("web_vitals_current", {
  description:
    "Current web vitals metrics with average values, scores, and descriptions",
  tokens: [{ token: dashboardToken, scope: "READ" }],
  nodes: [
    node({
      name: "daily_vitals",
      description: "Aggregate web vitals over specified time period",
      sql: `
        SELECT
            metric_name,
            avg(value) as avg_value,
            quantile(0.75)(value) as p75,
            quantile(0.90)(value) as p90,
            quantile(0.95)(value) as p95,
            quantile(0.99)(value) as p99,
            avg(delta) as avg_delta,
            count() as measurements,
            any(units) as units,
            any(description) as description,
            any(thresholds_text) as thresholds_text,
            domain,
            tenant_id
        FROM web_vitals_events
        WHERE timestamp >= now() - interval {{Int32(days, 1, description="Number of days to analyze")}} day
            {% if defined(tenant_id) %}
            AND tenant_id = {{ String(tenant_id, description="Filter by tenant ID") }}
            {% end %}
            {% if defined(domain) %}
            AND domain = {{ String(domain, description="Domain to filter") }}
            {% end %}
        GROUP BY metric_name, domain, tenant_id
        HAVING measurements >= 1
      `,
    }),
    node({
      name: "endpoint",
      description: "Calculate scores and status",
      sql: `
        SELECT
            metric_name,
            round(avg_value, 2) as avg_value,
            round(p75, 2) as p75,
            round(p90, 2) as p90,
            round(p95, 2) as p95,
            round(p99, 2) as p99,
            measurements,
            CASE
                WHEN metric_name = 'LCP' AND avg_value <= 2500 THEN 100
                WHEN metric_name = 'LCP' AND avg_value <= 4000 THEN 75
                WHEN metric_name = 'TTFB' AND avg_value <= 500 THEN 100
                WHEN metric_name = 'TTFB' AND avg_value <= 1000 THEN 75
                WHEN metric_name = 'FCP' AND avg_value <= 1800 THEN 100
                WHEN metric_name = 'FCP' AND avg_value <= 3000 THEN 75
                WHEN metric_name = 'INP' AND avg_value <= 200 THEN 100
                WHEN metric_name = 'INP' AND avg_value <= 500 THEN 75
                WHEN metric_name = 'CLS' AND avg_value <= 0.1 THEN 100
                WHEN metric_name = 'CLS' AND avg_value <= 0.25 THEN 75
                ELSE 25
            END as score,
            CASE
                WHEN metric_name = 'LCP' AND avg_value <= 2500 THEN 'Excellent'
                WHEN metric_name = 'LCP' AND avg_value <= 4000 THEN 'Good'
                WHEN metric_name = 'TTFB' AND avg_value <= 500 THEN 'Excellent'
                WHEN metric_name = 'TTFB' AND avg_value <= 1000 THEN 'Good'
                WHEN metric_name = 'FCP' AND avg_value <= 1800 THEN 'Excellent'
                WHEN metric_name = 'FCP' AND avg_value <= 3000 THEN 'Good'
                WHEN metric_name = 'INP' AND avg_value <= 200 THEN 'Excellent'
                WHEN metric_name = 'INP' AND avg_value <= 500 THEN 'Good'
                WHEN metric_name = 'CLS' AND avg_value <= 0.1 THEN 'Excellent'
                WHEN metric_name = 'CLS' AND avg_value <= 0.25 THEN 'Good'
                ELSE 'Poor'
            END as status,
            units,
            description,
            thresholds_text as thresholds,
            domain,
            tenant_id
        FROM daily_vitals
        ORDER BY metric_name
      `,
    }),
  ],
  params: {
    days: p.int32().optional(1).describe("Number of days to analyze"),
    tenant_id: p.string().optional().describe("Filter by tenant ID"),
    domain: p.string().optional().describe("Domain to filter"),
  },
  output: {
    metric_name: t.string(),
    avg_value: t.float64(),
    p75: t.float64(),
    p90: t.float64(),
    p95: t.float64(),
    p99: t.float64(),
    measurements: t.uint64(),
    score: t.uint8(),
    status: t.string(),
    units: t.string(),
    description: t.string(),
    thresholds: t.string(),
    domain: t.string(),
    tenant_id: t.string(),
  },
});

export type WebVitalsCurrentParams = InferParams<typeof webVitalsCurrent>;
export type WebVitalsCurrentOutput = InferOutputRow<typeof webVitalsCurrent>;

/**
 * Web vitals distribution - performance distribution across ranges
 */
export const webVitalsDistribution = defineEndpoint("web_vitals_distribution", {
  description:
    "Web vitals performance distribution with optional previous period comparison",
  tokens: [{ token: dashboardToken, scope: "READ" }],
  nodes: [
    node({
      name: "date_calculations",
      sql: `
        WITH
            {% if defined(date_from) and defined(date_to) %}
                toDate({{ String(date_from) }}) as current_start,
                toDate({{ String(date_to) }}) as current_end,
            {% else %}
                toDate(timestampAdd(today(), interval -1 day)) as current_start,
                toDate(today()) as current_end,
            {% end %}
            dateDiff('day', current_start, current_end) + 1 as period_days,
            timestampAdd(current_start, interval -period_days day) as previous_start,
            timestampAdd(current_end, interval -period_days day) as previous_end
        SELECT current_start, current_end, previous_start, previous_end, period_days
      `,
    }),
    node({
      name: "current_filtered_vitals",
      sql: `
        SELECT
            metric_name,
            value,
            performance_category,
            score,
            units,
            description,
            thresholds_text,
            domain,
            tenant_id
        FROM web_vitals_events
        WHERE
            timestamp >= toDateTime(concat(toString((SELECT current_start FROM date_calculations)), ' 00:00:00'))
            AND timestamp <= toDateTime(concat(toString((SELECT current_end FROM date_calculations)), ' 23:59:59'))
            {% if defined(tenant_id) %}
            AND tenant_id = {{ String(tenant_id, description="Filter by tenant ID") }}
            {% end %}
            {% if defined(domain) %}
            AND domain = {{ String(domain, description="Domain to filter") }}
            {% end %}
            AND performance_category != 'unknown'
      `,
    }),
    node({
      name: "current_category_stats",
      sql: `
        SELECT
            metric_name,
            performance_category,
            round(avg(value), 2) as current_avg_value,
            quantile(0.75)(value) as current_p75,
            quantile(0.90)(value) as current_p90,
            count() as current_measurement_count,
            any(score) as score,
            any(units) as units,
            any(description) as description,
            any(thresholds_text) as thresholds,
            domain,
            tenant_id
        FROM current_filtered_vitals
        GROUP BY metric_name, performance_category, domain, tenant_id
      `,
    }),
    node({
      name: "current_metric_totals",
      sql: `
        SELECT
            metric_name,
            sum(current_measurement_count) as current_total_measurements,
            domain,
            tenant_id
        FROM current_category_stats
        GROUP BY metric_name, domain, tenant_id
      `,
    }),
    node({
      name: "endpoint",
      sql: `
        SELECT
            cs.metric_name metric_name,
            cs.performance_category performance_category,
            cs.current_avg_value as avg_value,
            cs.current_p75 as p75,
            cs.current_p90 as p90,
            cs.current_measurement_count as measurement_count,
            round((cs.current_measurement_count * 100.0) / mt.current_total_measurements, 1) as percentage,
            mt.current_total_measurements as total_measurements,
            cs.score score,
            cs.units units,
            cs.thresholds thresholds,
            cs.description description,
            cs.domain domain
        FROM current_category_stats cs
        JOIN current_metric_totals mt ON cs.metric_name = mt.metric_name and cs.domain = mt.domain and cs.tenant_id = mt.tenant_id
        ORDER BY
            cs.metric_name,
            CASE cs.performance_category
                WHEN 'excellent' THEN 1
                WHEN 'good' THEN 2
                WHEN 'poor' THEN 3
                ELSE 4
            END
      `,
    }),
  ],
  params: {
    date_from: p.string().optional().describe("Start date"),
    date_to: p.string().optional().describe("End date"),
    tenant_id: p.string().optional().describe("Filter by tenant ID"),
    domain: p.string().optional().describe("Domain to filter"),
    include_previous_period: p
      .string()
      .optional()
      .describe("Include previous period"),
  },
  output: {
    metric_name: t.string(),
    performance_category: t.string(),
    avg_value: t.float64(),
    p75: t.float64(),
    p90: t.float64(),
    measurement_count: t.uint64(),
    percentage: t.float64(),
    total_measurements: t.uint64(),
    score: t.uint8(),
    units: t.string(),
    thresholds: t.string(),
    description: t.string(),
    domain: t.string(),
  },
});

export type WebVitalsDistributionParams = InferParams<
  typeof webVitalsDistribution
>;
export type WebVitalsDistributionOutput = InferOutputRow<
  typeof webVitalsDistribution
>;

/**
 * Web vitals routes - routes with vitals scores
 */
export const webVitalsRoutes = defineEndpoint("web_vitals_routes", {
  description: "Routes with web vitals scores, sortable by performance",
  tokens: [{ token: dashboardToken, scope: "READ" }],
  nodes: [
    node({
      name: "filtered_vitals",
      sql: `
        SELECT
            {% if defined(analysis_type) and analysis_type == 'pathnames' %}
                pathname as path_key,
                pathname as full_pathname,
                route
            {% else %}
                route as path_key,
                pathname as full_pathname,
                route
            {% end %},
            metric_name,
            value,
            score,
            domain
        FROM web_vitals_events
        WHERE timestamp >= now() - interval {{Int32(days, 1, description="Number of days to analyze")}} day
            {% if defined(tenant_id) %}
            AND tenant_id = {{ String(tenant_id, description="Filter by tenant ID") }}
            {% end %}
            {% if defined(domain) %}
            AND domain = {{ String(domain, description="Domain to filter") }}
            {% end %}
            {% if defined(route) %}
            AND route = {{ String(route, description="Route to filter by") }}
            {% end %}
      `,
    }),
    node({
      name: "route_metrics",
      sql: `
        WITH {{ String(analysis_type, '', required=False) }} as _at
        SELECT
            path_key,
            {% if defined(analysis_type) and analysis_type == 'pathnames' %}
                full_pathname,
                route,
            {% end %}
            metric_name,
            avg(value) as avg_value,
            avg(score) as avg_score,
            count() as measurements,
            domain
        FROM filtered_vitals
        WHERE path_key != ''
        GROUP BY path_key, metric_name, domain
            {% if defined(analysis_type) and analysis_type == 'pathnames' %}
            , full_pathname, route
            {% end %}
        HAVING measurements >= 3
      `,
    }),
    node({
      name: "route_summary",
      sql: `
        WITH {{ String(analysis_type, '', required=False) }} as _at
        SELECT
            path_key,
            {% if defined(analysis_type) and analysis_type == 'pathnames' %}
                full_pathname,
                route as route_part,
            {% end %}
            round(avg(avg_score), 2) as overall_score,
            round(avgIf(avg_value, metric_name = 'LCP'), 2) as lcp_avg,
            round(avgIf(avg_value, metric_name = 'TTFB'), 2) as ttfb_avg,
            round(avgIf(avg_value, metric_name = 'FCP'), 2) as fcp_avg,
            round(avgIf(avg_value, metric_name = 'INP'), 2) as inp_avg,
            round(avgIf(avg_value, metric_name = 'CLS'), 4) as cls_avg,
            round(avgIf(avg_score, metric_name = 'LCP'), 0) as lcp_score,
            round(avgIf(avg_score, metric_name = 'TTFB'), 0) as ttfb_score,
            round(avgIf(avg_score, metric_name = 'FCP'), 0) as fcp_score,
            round(avgIf(avg_score, metric_name = 'INP'), 0) as inp_score,
            round(avgIf(avg_score, metric_name = 'CLS'), 0) as cls_score,
            count(DISTINCT metric_name) as metrics_count,
            domain
        FROM route_metrics
        GROUP BY path_key, domain
            {% if defined(analysis_type) and analysis_type == 'pathnames' %}
            , full_pathname, route
            {% end %}
      `,
    }),
    node({
      name: "endpoint",
      sql: `
        SELECT
            path_key as {% if defined(analysis_type) and analysis_type == 'pathnames' %}pathname{% else %}route{% end %},
            {% if defined(analysis_type) and analysis_type == 'pathnames' %}
                full_pathname,
                route_part,
            {% end %}
            overall_score,
            lcp_avg,
            ttfb_avg,
            fcp_avg,
            inp_avg,
            cls_avg,
            lcp_score,
            ttfb_score,
            fcp_score,
            inp_score,
            cls_score,
            'LCP=ms, TTFB=ms, FCP=ms, INP=ms, CLS=score' as metric_units,
            domain,
            {% if defined(analysis_type) and analysis_type == 'pathnames' %}
                'pathnames' as analysis_type
            {% else %}
                'routes' as analysis_type
            {% end %}
        FROM route_summary
        ORDER BY
            {% if defined(sort_order) and sort_order == 'desc' %}
                overall_score DESC,
                lcp_score DESC
            {% else %}
                overall_score ASC,
                lcp_score ASC
            {% end %}
        LIMIT {{ Int32(skip, 0) }}, {{ Int32(limit, 10) }}
      `,
    }),
  ],
  params: {
    days: p.int32().optional(1).describe("Number of days to analyze"),
    tenant_id: p.string().optional().describe("Filter by tenant ID"),
    domain: p.string().optional().describe("Domain to filter"),
    route: p.string().optional().describe("Route to filter by"),
    analysis_type: p.string().optional().describe("'routes' or 'pathnames'"),
    sort_order: p
      .string()
      .optional()
      .describe("'asc' for best, 'desc' for worst"),
    skip: p.int32().optional(0).describe("Skip for pagination"),
    limit: p.int32().optional(10).describe("Limit for pagination"),
  },
  output: {
    route: t.string(),
    overall_score: t.float64(),
    lcp_avg: t.float64().nullable(),
    ttfb_avg: t.float64().nullable(),
    fcp_avg: t.float64().nullable(),
    inp_avg: t.float64().nullable(),
    cls_avg: t.float64().nullable(),
    lcp_score: t.float64().nullable(),
    ttfb_score: t.float64().nullable(),
    fcp_score: t.float64().nullable(),
    inp_score: t.float64().nullable(),
    cls_score: t.float64().nullable(),
    metric_units: t.string(),
    domain: t.string(),
    analysis_type: t.string(),
  },
});

export type WebVitalsRoutesParams = InferParams<typeof webVitalsRoutes>;
export type WebVitalsRoutesOutput = InferOutputRow<typeof webVitalsRoutes>;

/**
 * Web vitals timeseries - hourly quantile values
 */
export const webVitalsTimeseries = defineEndpoint("web_vitals_timeseries", {
  description: "Hourly time series of web vitals quantile values",
  tokens: [{ token: dashboardToken, scope: "READ" }],
  nodes: [
    node({
      name: "filtered_vitals",
      sql: `
        SELECT
            toStartOfHour(timestamp) as hour,
            metric_name,
            value,
            domain,
            tenant_id
        FROM web_vitals_events
        WHERE 1=1
            {% if defined(date_from) %}
            AND timestamp >= toDateTime(concat(toString({{ Date(date_from) }}), ' 00:00:00'))
            {% end %}
            {% if defined(date_to) %}
            AND timestamp <= toDateTime(concat(toString({{ Date(date_to) }}), ' 23:59:59'))
            {% end %}
            {% if defined(tenant_id) %}
            AND tenant_id = {{ String(tenant_id, description="Filter by tenant ID") }}
            {% end %}
            {% if defined(domain) %}
            AND domain = {{ String(domain, description="Domain to filter") }}
            {% end %}
      `,
    }),
    node({
      name: "endpoint",
      sql: `
        SELECT
            hour,
            metric_name,
            quantile(0.75)(value) as p75,
            quantile(0.90)(value) as p90,
            quantile(0.95)(value) as p95,
            quantile(0.99)(value) as p99,
            count() as measurements,
            domain
        FROM filtered_vitals
        GROUP BY hour, metric_name, domain
        HAVING measurements >= 5
        ORDER BY hour ASC, metric_name ASC
      `,
    }),
  ],
  params: {
    date_from: p.date().optional().describe("Start date"),
    date_to: p.date().optional().describe("End date"),
    tenant_id: p.string().optional().describe("Filter by tenant ID"),
    domain: p.string().optional().describe("Domain to filter"),
  },
  output: {
    hour: t.dateTime(),
    metric_name: t.string(),
    p75: t.float64(),
    p90: t.float64(),
    p95: t.float64(),
    p99: t.float64(),
    measurements: t.uint64(),
    domain: t.string(),
  },
});

export type WebVitalsTimeseriesParams = InferParams<typeof webVitalsTimeseries>;
export type WebVitalsTimeseriesOutput = InferOutputRow<
  typeof webVitalsTimeseries
>;
