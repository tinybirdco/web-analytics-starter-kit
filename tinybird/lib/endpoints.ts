/**
 * Tinybird Endpoint Definitions
 */

import {
  defineEndpoint,
  node,
  t,
  p,
  type InferParams,
  type InferOutputRow,
} from "@tinybirdco/sdk";
import { dashboardToken } from "./tokens.js";

// ============================================================================
// Core Endpoints
// ============================================================================

/**
 * Current visitors - realtime visitor count
 */
export const currentVisitors = defineEndpoint("current_visitors", {
  tokens: [{ token: dashboardToken, scope: "READ" }],
  nodes: [
    node({
      name: "get_current_visitors",
      sql: `
        SELECT uniq(session_id) AS visits
        FROM analytics_hits
        WHERE timestamp >= (now() - interval 5 minute)
            {% if defined(tenant_id) %}
            AND tenant_id = {{ String(tenant_id, description="Filter by tenant ID") }}
            {% end %}
            {% if defined(domain) %}
            AND domain = {{ String(domain, description="Filter by domain") }}
            {% end %}
      `,
    }),
  ],
  params: {
    tenant_id: p.string().optional().describe("Filter by tenant ID"),
    domain: p.string().optional().describe("Filter by domain"),
  },
  output: {
    visits: t.uint64(),
  },
});

export type CurrentVisitorsParams = InferParams<typeof currentVisitors>;
export type CurrentVisitorsOutput = InferOutputRow<typeof currentVisitors>;

/**
 * Domain - get the current active domain
 */
export const domain = defineEndpoint("domain", {
  tokens: [{ token: dashboardToken, scope: "READ" }],
  nodes: [
    node({
      name: "get_current_domain",
      sql: `
        WITH (
        SELECT nullif(domainWithoutWWW(href),'') as domain
        FROM analytics_hits
        WHERE timestamp >= now() - interval 1 hour
        GROUP BY domain
        ORDER BY count(1) DESC
        LIMIT 1
        ) AS top_domain,
        (
        SELECT domainWithoutWWW(href)
        FROM analytics_hits
        WHERE href NOT LIKE '%localhost%'
        LIMIT 1
        ) AS some_domain
        SELECT coalesce(top_domain, some_domain) AS domain
      `,
    }),
  ],
  output: {
    domain: t.string(),
  },
});

export type DomainOutput = InferOutputRow<typeof domain>;

/**
 * Domains - list domains for a tenant
 */
export const domains = defineEndpoint("domains", {
  description:
    "Returns domains for a tenant with first/last seen and total hits",
  tokens: [{ token: dashboardToken, scope: "READ" }],
  nodes: [
    node({
      name: "endpoint",
      description: "Get domains for a specific tenant",
      sql: `
        SELECT
            domain,
            minSimpleState(first_seen) AS first_seen,
            maxSimpleState(last_seen) AS last_seen,
            countMerge(total_hits) AS total_hits
        FROM tenant_domains_mv
        WHERE tenant_id = {{ String(tenant_id, description="Tenant ID to filter", default="") }}
        GROUP BY domain
        ORDER BY total_hits DESC, domain ASC
      `,
    }),
  ],
  params: {
    tenant_id: p.string().optional("").describe("Tenant ID to filter"),
  },
  output: {
    domain: t.string(),
    first_seen: t.dateTime(),
    last_seen: t.dateTime(),
    total_hits: t.uint64(),
  },
});

export type DomainsParams = InferParams<typeof domains>;
export type DomainsOutput = InferOutputRow<typeof domains>;

/**
 * Actions - get distinct actions for a tenant
 */
export const actions = defineEndpoint("actions", {
  description:
    "Get distinct action types with sample payload for each tenant/domain",
  tokens: [{ token: dashboardToken, scope: "READ" }],
  nodes: [
    node({
      name: "endpoint",
      description: "Get distinct actions for a specific tenant",
      sql: `
        SELECT
            domain,
            action,
            anySimpleState(last_payload) AS last_payload,
            maxSimpleState(last_seen) AS last_seen,
            countMerge(total_occurrences) AS total_occurrences
        FROM tenant_actions_mv
        WHERE tenant_id = {{ String(tenant_id, description="Tenant ID to filter", default="") }}
        {% if defined(action_filter) %}
            AND action like {{String(action_filter, description="A like filter for actions", example="%cli_%")}}
        {% end %}
        GROUP BY domain, action
        ORDER BY last_seen DESC, domain ASC, action ASC
      `,
    }),
  ],
  params: {
    tenant_id: p.string().optional("").describe("Tenant ID to filter"),
    action_filter: p.string().optional().describe("Like filter for actions"),
  },
  output: {
    domain: t.string(),
    action: t.string(),
    last_payload: t.string(),
    last_seen: t.dateTime(),
    total_occurrences: t.uint64(),
  },
});

export type ActionsParams = InferParams<typeof actions>;
export type ActionsOutput = InferOutputRow<typeof actions>;

/**
 * KPIs - summary with visits, page views, bounce rate, avg session duration
 */
export const kpis = defineEndpoint("kpis", {
  description: "Summary KPIs per date with optional previous period comparison",
  tokens: [{ token: dashboardToken, scope: "READ" }],
  nodes: [
    node({
      name: "date_calculations",
      description: "Calculate current and previous period date ranges",
      sql: `
        WITH
            {% if defined(date_from) %}
                toStartOfDay(toDate({{ String(date_from, description="Starting day") }})) as current_start,
            {% else %} toStartOfDay(timestampAdd(today(), interval -7 day)) as current_start,
            {% end %}
            {% if defined(date_to) %}
                toStartOfDay(toDate({{ String(date_to, description="Finishing day") }})) as current_end
            {% else %} toStartOfDay(today()) as current_end
            {% end %}
        SELECT
            current_start,
            current_end,
            dateDiff('day', current_start, current_end) + 1 as period_days,
            timestampAdd(current_start, interval -dateDiff('day', current_start, current_end) - 1 day) as previous_start,
            timestampAdd(current_end, interval -dateDiff('day', current_start, current_end) - 1 day) as previous_end
      `,
    }),
    node({
      name: "timeseries",
      description: "Generate timeseries for the time range",
      sql: `
        with
            (SELECT current_start FROM date_calculations) as start,
            (SELECT current_end FROM date_calculations) as end,
            (SELECT period_days FROM date_calculations) as days_count,
            {{ String(date_from, '', description="Start date for range", required=False) }} as _df,
            {{ String(date_to, '', description="End date for range", required=False) }} as _dt
        {% if defined(date_from) and defined(date_to) and date_from == date_to %}
            select arrayJoin(arrayMap(x -> toDateTime(x), range(toUInt32(toDateTime(start)), toUInt32(timestampAdd(end, interval 1 day)), 3600))) as date
        {% else %}
            select arrayJoin(arrayMap(x -> toDate(x), range(toUInt32(start), toUInt32(timestampAdd(end, interval 1 day)), 24 * 3600))) as date
        {% end %}
        where date <= now()
      `,
    }),
    node({
      name: "hits",
      description: "Group by sessions and calculate metrics",
      sql: `
        {% if defined(date_from) and defined(date_to) and date_from == date_to %}
            select
                toStartOfHour(timestamp) as date,
                session_id,
                uniq(session_id) as visits,
                count() as pageviews,
                case when min(timestamp) = max(timestamp) then 1 else 0 end as is_bounce,
                max(timestamp) as latest_hit_aux,
                min(timestamp) as first_hit_aux
            from analytics_hits
            where toDate(timestamp) = toDate({{ String(date_from) }})
                {% if defined(tenant_id) %}
                AND tenant_id = {{ String(tenant_id, description="Filter by tenant ID") }}
                {% end %}
                {% if defined(domain) %}
                AND domain = {{ String(domain, description="Filter by domain") }}
                {% end %}
            group by toStartOfHour(timestamp), session_id, tenant_id, domain
        {% else %}
            select
                date,
                session_id,
                uniq(session_id) as visits,
                countMerge(hits) as pageviews,
                case when min(first_hit) = max(latest_hit) then 1 else 0 end as is_bounce,
                max(latest_hit) as latest_hit_aux,
                min(first_hit) as first_hit_aux
            from analytics_sessions_mv
            where
                date >= (SELECT current_start FROM date_calculations)
                and date <= (SELECT current_end FROM date_calculations)
                {% if defined(tenant_id) %}
                AND tenant_id = {{ String(tenant_id, description="Filter by tenant ID") }}
                {% end %}
                {% if defined(domain) %}
                AND domain = {{ String(domain, description="Filter by domain") }}
                {% end %}
            group by date, session_id, tenant_id, domain
        {% end %}
      `,
    }),
    node({
      name: "current_period_data",
      description: "General KPIs per date for current period",
      sql: `
        select
            date,
            uniq(session_id) as current_visits,
            sum(pageviews) as current_pageviews,
            sum(case when latest_hit_aux = first_hit_aux then 1 end) / uniq(session_id) as current_bounce_rate,
            avg(latest_hit_aux - first_hit_aux) as current_avg_session_sec
        from hits
        group by date
      `,
    }),
    node({
      name: "previous_period_hits",
      description: "Group by sessions for previous period",
      sql: `
        {% if defined(include_previous_period) and include_previous_period == 'true' %}
            {% if defined(date_from) and defined(date_to) and date_from == date_to %}
                select
                    toStartOfHour(timestamp) as date,
                    session_id,
                    uniq(session_id) as visits,
                    count() as pageviews,
                    case when min(timestamp) = max(timestamp) then 1 else 0 end as is_bounce,
                    max(timestamp) as latest_hit_aux,
                    min(timestamp) as first_hit_aux
                from analytics_hits
                where toDate(timestamp) = timestampAdd(toDate({{ String(date_from) }}), interval -1 day)
                    {% if defined(tenant_id) %}
                    AND tenant_id = {{ String(tenant_id, description="Filter by tenant ID") }}
                    {% end %}
                    {% if defined(domain) %}
                    AND domain = {{ String(domain, description="Filter by domain") }}
                    {% end %}
                group by toStartOfHour(timestamp), session_id, tenant_id, domain
            {% else %}
                select
                    date,
                    session_id,
                    uniq(session_id) as visits,
                    countMerge(hits) as pageviews,
                    case when min(first_hit) = max(latest_hit) then 1 else 0 end as is_bounce,
                    max(latest_hit) as latest_hit_aux,
                    min(first_hit) as first_hit_aux
                from analytics_sessions_mv
                where
                    date >= (SELECT previous_start FROM date_calculations)
                    and date <= (SELECT previous_end FROM date_calculations)
                    {% if defined(tenant_id) %}
                    AND tenant_id = {{ String(tenant_id, description="Filter by tenant ID") }}
                    {% end %}
                    {% if defined(domain) %}
                    AND domain = {{ String(domain, description="Filter by domain") }}
                    {% end %}
                group by date, session_id, tenant_id, domain
            {% end %}
        {% else %}
            SELECT toDate('1900-01-01') as date, '' as session_id, 0 as visits, 0 as pageviews, 0 as is_bounce,
                   toDateTime('1900-01-01') as latest_hit_aux, toDateTime('1900-01-01') as first_hit_aux WHERE 1=0
        {% end %}
      `,
    }),
    node({
      name: "previous_period_data",
      description: "General KPIs per date for previous period",
      sql: `
        WITH {{ String(include_previous_period, '', required=False) }} as _ipp
        {% if defined(include_previous_period) and include_previous_period == 'true' %}
        select
            date,
            uniq(session_id) as previous_visits,
            sum(pageviews) as previous_pageviews,
            sum(case when latest_hit_aux = first_hit_aux then 1 end) / uniq(session_id) as previous_bounce_rate,
            avg(latest_hit_aux - first_hit_aux) as previous_avg_session_sec
        from previous_period_hits
        group by date
        {% else %}
        SELECT toDate('1900-01-01') as date, 0 as previous_visits, 0 as previous_pageviews,
               0 as previous_bounce_rate, 0 as previous_avg_session_sec WHERE 1=0
        {% end %}
      `,
    }),
    node({
      name: "endpoint",
      description: "Join and generate timeseries with metrics and growth",
      sql: `
        WITH {{ String(include_previous_period, '', required=False) }} as _ipp
        {% if defined(include_previous_period) and include_previous_period == 'true' %}
        SELECT
            a.date date,
            coalesce(b.current_visits, 0) as visits,
            coalesce(b.current_pageviews, 0) as pageviews,
            coalesce(b.current_bounce_rate, 0) as bounce_rate,
            coalesce(b.current_avg_session_sec, 0) as avg_session_sec,
            coalesce(p.previous_visits, 0) as previous_visits,
            coalesce(p.previous_pageviews, 0) as previous_pageviews,
            coalesce(p.previous_bounce_rate, 0) as previous_bounce_rate,
            coalesce(p.previous_avg_session_sec, 0) as previous_avg_session_sec,
            CASE
                WHEN coalesce(p.previous_visits, 0) = 0 AND coalesce(b.current_visits, 0) > 0 THEN 100.0
                WHEN coalesce(p.previous_visits, 0) = 0 THEN 0.0
                ELSE round(((coalesce(b.current_visits, 0) - coalesce(p.previous_visits, 0)) * 100.0) / p.previous_visits, 2)
            END as visits_growth_percentage,
            CASE
                WHEN coalesce(p.previous_pageviews, 0) = 0 AND coalesce(b.current_pageviews, 0) > 0 THEN 100.0
                WHEN coalesce(p.previous_pageviews, 0) = 0 THEN 0.0
                ELSE round(((coalesce(b.current_pageviews, 0) - coalesce(p.previous_pageviews, 0)) * 100.0) / p.previous_pageviews, 2)
            END as pageviews_growth_percentage,
            CASE
                WHEN coalesce(p.previous_bounce_rate, 0) = 0 AND coalesce(b.current_bounce_rate, 0) > 0 THEN 100.0
                WHEN coalesce(p.previous_bounce_rate, 0) = 0 THEN 0.0
                ELSE round(((coalesce(b.current_bounce_rate, 0) - coalesce(p.previous_bounce_rate, 0)) * 100.0) / p.previous_bounce_rate, 2)
            END as bounce_rate_growth_percentage,
            CASE
                WHEN coalesce(p.previous_avg_session_sec, 0) = 0 AND coalesce(b.current_avg_session_sec, 0) > 0 THEN 100.0
                WHEN coalesce(p.previous_avg_session_sec, 0) = 0 THEN 0.0
                ELSE round(((coalesce(b.current_avg_session_sec, 0) - coalesce(p.previous_avg_session_sec, 0)) * 100.0) / p.previous_avg_session_sec, 2)
            END as avg_session_sec_growth_percentage
        FROM timeseries a
        LEFT JOIN current_period_data b ON a.date = b.date
        LEFT JOIN previous_period_data p ON a.date = timestampAdd(p.date, interval (SELECT period_days FROM date_calculations) day)
        WHERE a.date >= (SELECT current_start FROM date_calculations) AND a.date <= (SELECT current_end FROM date_calculations)
        {% else %}
        SELECT
            a.date date,
            coalesce(b.current_visits, 0) as visits,
            coalesce(b.current_pageviews, 0) as pageviews,
            coalesce(b.current_bounce_rate, 0) as bounce_rate,
            coalesce(b.current_avg_session_sec, 0) as avg_session_sec
        FROM timeseries a
        LEFT JOIN current_period_data b USING date
        {% end %}
      `,
    }),
  ],
  params: {
    date_from: p.string().optional().describe("Starting day"),
    date_to: p.string().optional().describe("Finishing day"),
    tenant_id: p.string().optional().describe("Filter by tenant ID"),
    domain: p.string().optional().describe("Filter by domain"),
    include_previous_period: p
      .string()
      .optional()
      .describe("Include previous period comparison"),
  },
  output: {
    date: t.date(),
    visits: t.uint64(),
    pageviews: t.uint64(),
    bounce_rate: t.float64(),
    avg_session_sec: t.float64(),
  },
});

export type KpisParams = InferParams<typeof kpis>;
export type KpisOutput = InferOutputRow<typeof kpis>;

/**
 * Trend - realtime visits trend for last 30 minutes
 */
export const trend = defineEndpoint("trend", {
  description:
    "Visits trend over time for the last 30 minutes - great for realtime chart",
  tokens: [{ token: dashboardToken, scope: "READ" }],
  nodes: [
    node({
      name: "timeseries",
      description: "Generate timeseries for last 30 minutes",
      sql: `
        with (now() - interval 30 minute) as start
        select addMinutes(toStartOfMinute(start), number) as t
        from (select arrayJoin(range(1, 31)) as number)
      `,
    }),
    node({
      name: "hits",
      description: "Get last 30 minutes metrics grouped by minute",
      sql: `
        select toStartOfMinute(timestamp) as t, uniq(session_id) as visits
        from analytics_hits
        where timestamp >= (now() - interval 30 minute)
            {% if defined(tenant_id) %}
            AND tenant_id = {{ String(tenant_id, description="Filter by tenant ID") }}
            {% end %}
            {% if defined(domain) %}
            AND domain = {{ String(domain, description="Filter by domain") }}
            {% end %}
        group by toStartOfMinute(timestamp)
        order by toStartOfMinute(timestamp)
      `,
    }),
    node({
      name: "endpoint",
      description: "Join and generate timeseries with metrics",
      sql: `
        select a.t, b.visits from timeseries a left join hits b on a.t = b.t order by a.t
      `,
    }),
  ],
  params: {
    tenant_id: p.string().optional().describe("Filter by tenant ID"),
    domain: p.string().optional().describe("Filter by domain"),
  },
  output: {
    t: t.dateTime(),
    visits: t.uint64().nullable(),
  },
});

export type TrendParams = InferParams<typeof trend>;
export type TrendOutput = InferOutputRow<typeof trend>;

// ============================================================================
// Top-N Endpoints
// ============================================================================

/**
 * Top browsers - ordered by most visits
 */
export const topBrowsers = defineEndpoint("top_browsers", {
  description:
    "Top browsers ordered by most visits with optional previous period comparison",
  tokens: [{ token: dashboardToken, scope: "READ" }],
  nodes: [
    node({
      name: "date_calculations",
      description: "Calculate current and previous period date ranges",
      sql: `
        WITH
            {% if defined(date_from) and defined(date_to) %}
                toDate({{ String(date_from) }}) as current_start,
                toDate({{ String(date_to) }}) as current_end,
            {% else %}
                toDate(timestampAdd(today(), interval -7 day)) as current_start,
                toDate(today()) as current_end,
            {% end %}
            dateDiff('day', current_start, current_end) + 1 as period_days,
            timestampAdd(current_start, interval -period_days day) as previous_start,
            timestampAdd(current_end, interval -period_days day) as previous_end
        SELECT current_start, current_end, previous_start, previous_end, period_days
      `,
    }),
    node({
      name: "current_period_data",
      description: "Get browser metrics for current period",
      sql: `
        SELECT
            browser,
            uniq(session_id) as current_visits,
            countMerge(hits) as current_hits
        FROM analytics_sessions_mv
        WHERE date >= (SELECT current_start FROM date_calculations)
            AND date <= (SELECT current_end FROM date_calculations)
            {% if defined(tenant_id) %}
            AND tenant_id = {{ String(tenant_id, description="Filter by tenant ID") }}
            {% end %}
            {% if defined(domain) %}
            AND domain = {{ String(domain, description="Filter by domain") }}
            {% end %}
        GROUP BY browser
      `,
    }),
    node({
      name: "previous_period_data",
      description: "Get browser metrics for previous period",
      sql: `
        {% if defined(include_previous_period) and include_previous_period == 'true' %}
        SELECT
            browser,
            uniq(session_id) as previous_visits,
            countMerge(hits) as previous_hits
        FROM analytics_sessions_mv
        WHERE date >= (SELECT previous_start FROM date_calculations)
            AND date <= (SELECT previous_end FROM date_calculations)
            {% if defined(tenant_id) %}
            AND tenant_id = {{ String(tenant_id, description="Filter by tenant ID") }}
            {% end %}
            {% if defined(domain) %}
            AND domain = {{ String(domain, description="Filter by domain") }}
            {% end %}
        GROUP BY browser
        {% else %}
        SELECT '' as browser, 0 as previous_visits, 0 as previous_hits WHERE 1=0
        {% end %}
      `,
    }),
    node({
      name: "endpoint",
      description: "Combine with growth calculations",
      sql: `
        {% if defined(include_previous_period) and include_previous_period == 'true' %}
        SELECT
            c.browser,
            c.current_visits as visits,
            c.current_hits as hits,
            coalesce(p.previous_visits, 0) as previous_visits,
            coalesce(p.previous_hits, 0) as previous_hits,
            CASE
                WHEN coalesce(p.previous_visits, 0) = 0 AND c.current_visits > 0 THEN 100.0
                WHEN coalesce(p.previous_visits, 0) = 0 THEN 0.0
                ELSE round(((c.current_visits - coalesce(p.previous_visits, 0)) * 100.0) / p.previous_visits, 2)
            END as visits_growth_percentage,
            CASE
                WHEN coalesce(p.previous_hits, 0) = 0 AND c.current_hits > 0 THEN 100.0
                WHEN coalesce(p.previous_hits, 0) = 0 THEN 0.0
                ELSE round(((c.current_hits - coalesce(p.previous_hits, 0)) * 100.0) / p.previous_hits, 2)
            END as hits_growth_percentage
        FROM current_period_data c
        LEFT JOIN previous_period_data p ON c.browser = p.browser
        ORDER BY c.current_visits DESC
        LIMIT {{ Int32(skip, 0) }}, {{ Int32(limit, 50) }}
        {% else %}
        SELECT
            browser,
            current_visits as visits,
            current_hits as hits
        FROM current_period_data
        ORDER BY current_visits DESC
        LIMIT {{ Int32(skip, 0) }}, {{ Int32(limit, 50) }}
        {% end %}
      `,
    }),
  ],
  params: {
    date_from: p.string().optional().describe("Start date"),
    date_to: p.string().optional().describe("End date"),
    tenant_id: p.string().optional().describe("Filter by tenant ID"),
    domain: p.string().optional().describe("Filter by domain"),
    include_previous_period: p
      .string()
      .optional()
      .describe("Include previous period"),
    skip: p.int32().optional(0).describe("Skip for pagination"),
    limit: p.int32().optional(50).describe("Limit for pagination"),
  },
  output: {
    browser: t.string(),
    visits: t.uint64(),
    hits: t.uint64(),
  },
});

export type TopBrowsersParams = InferParams<typeof topBrowsers>;
export type TopBrowsersOutput = InferOutputRow<typeof topBrowsers>;

/**
 * Top devices - ordered by most visits
 */
export const topDevices = defineEndpoint("top_devices", {
  description:
    "Top device types ordered by most visits with optional previous period comparison",
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
                toDate(timestampAdd(today(), interval -7 day)) as current_start,
                toDate(today()) as current_end,
            {% end %}
            dateDiff('day', current_start, current_end) + 1 as period_days,
            timestampAdd(current_start, interval -period_days day) as previous_start,
            timestampAdd(current_end, interval -period_days day) as previous_end
        SELECT current_start, current_end, previous_start, previous_end, period_days
      `,
    }),
    node({
      name: "current_period_data",
      sql: `
        SELECT
            device,
            uniq(session_id) as current_visits,
            countMerge(hits) as current_hits
        FROM analytics_sessions_mv
        WHERE date >= (SELECT current_start FROM date_calculations)
            AND date <= (SELECT current_end FROM date_calculations)
            {% if defined(tenant_id) %}
            AND tenant_id = {{ String(tenant_id, description="Filter by tenant ID") }}
            {% end %}
            {% if defined(domain) %}
            AND domain = {{ String(domain, description="Filter by domain") }}
            {% end %}
        GROUP BY device
      `,
    }),
    node({
      name: "previous_period_data",
      sql: `
        {% if defined(include_previous_period) and include_previous_period == 'true' %}
        SELECT
            device,
            uniq(session_id) as previous_visits,
            countMerge(hits) as previous_hits
        FROM analytics_sessions_mv
        WHERE date >= (SELECT previous_start FROM date_calculations)
            AND date <= (SELECT previous_end FROM date_calculations)
            {% if defined(tenant_id) %}
            AND tenant_id = {{ String(tenant_id, description="Filter by tenant ID") }}
            {% end %}
            {% if defined(domain) %}
            AND domain = {{ String(domain, description="Filter by domain") }}
            {% end %}
        GROUP BY device
        {% else %}
        SELECT '' as device, 0 as previous_visits, 0 as previous_hits WHERE 1=0
        {% end %}
      `,
    }),
    node({
      name: "endpoint",
      sql: `
        {% if defined(include_previous_period) and include_previous_period == 'true' %}
        SELECT
            c.device,
            c.current_visits as visits,
            c.current_hits as hits,
            coalesce(p.previous_visits, 0) as previous_visits,
            coalesce(p.previous_hits, 0) as previous_hits,
            CASE
                WHEN coalesce(p.previous_visits, 0) = 0 AND c.current_visits > 0 THEN 100.0
                WHEN coalesce(p.previous_visits, 0) = 0 THEN 0.0
                ELSE round(((c.current_visits - coalesce(p.previous_visits, 0)) * 100.0) / p.previous_visits, 2)
            END as visits_growth_percentage,
            CASE
                WHEN coalesce(p.previous_hits, 0) = 0 AND c.current_hits > 0 THEN 100.0
                WHEN coalesce(p.previous_hits, 0) = 0 THEN 0.0
                ELSE round(((c.current_hits - coalesce(p.previous_hits, 0)) * 100.0) / p.previous_hits, 2)
            END as hits_growth_percentage
        FROM current_period_data c
        LEFT JOIN previous_period_data p ON c.device = p.device
        ORDER BY c.current_visits DESC
        LIMIT {{ Int32(skip, 0) }}, {{ Int32(limit, 50) }}
        {% else %}
        SELECT
            device,
            current_visits as visits,
            current_hits as hits
        FROM current_period_data
        ORDER BY current_visits DESC
        LIMIT {{ Int32(skip, 0) }}, {{ Int32(limit, 50) }}
        {% end %}
      `,
    }),
  ],
  params: {
    date_from: p.string().optional().describe("Start date"),
    date_to: p.string().optional().describe("End date"),
    tenant_id: p.string().optional().describe("Filter by tenant ID"),
    domain: p.string().optional().describe("Filter by domain"),
    include_previous_period: p
      .string()
      .optional()
      .describe("Include previous period"),
    skip: p.int32().optional(0).describe("Skip for pagination"),
    limit: p.int32().optional(50).describe("Limit for pagination"),
  },
  output: {
    device: t.string(),
    visits: t.uint64(),
    hits: t.uint64(),
  },
});

export type TopDevicesParams = InferParams<typeof topDevices>;
export type TopDevicesOutput = InferOutputRow<typeof topDevices>;

/**
 * Top locations - countries ordered by most visits
 */
export const topLocations = defineEndpoint("top_locations", {
  description:
    "Top visiting countries ordered by most visits with optional previous period comparison",
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
                toDate(timestampAdd(today(), interval -7 day)) as current_start,
                toDate(today()) as current_end,
            {% end %}
            dateDiff('day', current_start, current_end) + 1 as period_days,
            timestampAdd(current_start, interval -period_days day) as previous_start,
            timestampAdd(current_end, interval -period_days day) as previous_end
        SELECT current_start, current_end, previous_start, previous_end, period_days
      `,
    }),
    node({
      name: "current_period_data",
      sql: `
        SELECT
            location,
            uniqMerge(visits) as current_visits,
            countMerge(hits) as current_hits
        FROM analytics_pages_mv
        WHERE date >= (SELECT current_start FROM date_calculations)
            AND date <= (SELECT current_end FROM date_calculations)
            {% if defined(tenant_id) %}
            AND tenant_id = {{ String(tenant_id, description="Filter by tenant ID") }}
            {% end %}
            {% if defined(domain) %}
            AND domain = {{ String(domain, description="Filter by domain") }}
            {% end %}
        GROUP BY location
      `,
    }),
    node({
      name: "previous_period_data",
      sql: `
        {% if defined(include_previous_period) and include_previous_period == 'true' %}
        SELECT
            location,
            uniqMerge(visits) as previous_visits,
            countMerge(hits) as previous_hits
        FROM analytics_pages_mv
        WHERE date >= (SELECT previous_start FROM date_calculations)
            AND date <= (SELECT previous_end FROM date_calculations)
            {% if defined(tenant_id) %}
            AND tenant_id = {{ String(tenant_id, description="Filter by tenant ID") }}
            {% end %}
            {% if defined(domain) %}
            AND domain = {{ String(domain, description="Filter by domain") }}
            {% end %}
        GROUP BY location
        {% else %}
        SELECT '' as location, 0 as previous_visits, 0 as previous_hits WHERE 1=0
        {% end %}
      `,
    }),
    node({
      name: "endpoint",
      sql: `
        {% if defined(include_previous_period) and include_previous_period == 'true' %}
        SELECT
            c.location,
            c.current_visits as visits,
            c.current_hits as hits,
            coalesce(p.previous_visits, 0) as previous_visits,
            coalesce(p.previous_hits, 0) as previous_hits,
            CASE
                WHEN coalesce(p.previous_visits, 0) = 0 AND c.current_visits > 0 THEN 100.0
                WHEN coalesce(p.previous_visits, 0) = 0 THEN 0.0
                ELSE round(((c.current_visits - coalesce(p.previous_visits, 0)) * 100.0) / p.previous_visits, 2)
            END as visits_growth_percentage,
            CASE
                WHEN coalesce(p.previous_hits, 0) = 0 AND c.current_hits > 0 THEN 100.0
                WHEN coalesce(p.previous_hits, 0) = 0 THEN 0.0
                ELSE round(((c.current_hits - coalesce(p.previous_hits, 0)) * 100.0) / p.previous_hits, 2)
            END as hits_growth_percentage
        FROM current_period_data c
        LEFT JOIN previous_period_data p ON c.location = p.location
        ORDER BY c.current_visits DESC
        LIMIT {{ Int32(skip, 0) }}, {{ Int32(limit, 50) }}
        {% else %}
        SELECT
            location,
            current_visits as visits,
            current_hits as hits
        FROM current_period_data
        ORDER BY current_visits DESC
        LIMIT {{ Int32(skip, 0) }}, {{ Int32(limit, 50) }}
        {% end %}
      `,
    }),
  ],
  params: {
    date_from: p.string().optional().describe("Start date"),
    date_to: p.string().optional().describe("End date"),
    tenant_id: p.string().optional().describe("Filter by tenant ID"),
    domain: p.string().optional().describe("Filter by domain"),
    include_previous_period: p
      .string()
      .optional()
      .describe("Include previous period"),
    skip: p.int32().optional(0).describe("Skip for pagination"),
    limit: p.int32().optional(50).describe("Limit for pagination"),
  },
  output: {
    location: t.string(),
    visits: t.uint64(),
    hits: t.uint64(),
  },
});

export type TopLocationsParams = InferParams<typeof topLocations>;
export type TopLocationsOutput = InferOutputRow<typeof topLocations>;

/**
 * Top pages - most visited pages
 */
export const topPages = defineEndpoint("top_pages", {
  description: "Most visited pages with optional previous period comparison",
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
                toDate(timestampAdd(today(), interval -7 day)) as current_start,
                toDate(today()) as current_end,
            {% end %}
            dateDiff('day', current_start, current_end) + 1 as period_days,
            timestampAdd(current_start, interval -period_days day) as previous_start,
            timestampAdd(current_end, interval -period_days day) as previous_end
        SELECT current_start, current_end, previous_start, previous_end, period_days
      `,
    }),
    node({
      name: "current_period_data",
      sql: `
        SELECT
            pathname,
            uniqMerge(visits) as current_visits,
            countMerge(hits) as current_hits
        FROM analytics_pages_mv
        WHERE date >= (SELECT current_start FROM date_calculations)
            AND date <= (SELECT current_end FROM date_calculations)
            {% if defined(tenant_id) %}
            AND tenant_id = {{ String(tenant_id, description="Filter by tenant ID") }}
            {% end %}
            {% if defined(domain) %}
            AND domain = {{ String(domain, description="Filter by domain") }}
            {% end %}
        GROUP BY pathname
      `,
    }),
    node({
      name: "previous_period_data",
      sql: `
        {% if defined(include_previous_period) and include_previous_period == 'true' %}
        SELECT
            pathname,
            uniqMerge(visits) as previous_visits,
            countMerge(hits) as previous_hits
        FROM analytics_pages_mv
        WHERE date >= (SELECT previous_start FROM date_calculations)
            AND date <= (SELECT previous_end FROM date_calculations)
            {% if defined(tenant_id) %}
            AND tenant_id = {{ String(tenant_id, description="Filter by tenant ID") }}
            {% end %}
            {% if defined(domain) %}
            AND domain = {{ String(domain, description="Filter by domain") }}
            {% end %}
        GROUP BY pathname
        {% else %}
        SELECT '' as pathname, 0 as previous_visits, 0 as previous_hits WHERE 1=0
        {% end %}
      `,
    }),
    node({
      name: "endpoint",
      sql: `
        {% if defined(include_previous_period) and include_previous_period == 'true' %}
        SELECT
            c.pathname,
            c.current_visits as visits,
            c.current_hits as hits,
            coalesce(p.previous_visits, 0) as previous_visits,
            coalesce(p.previous_hits, 0) as previous_hits,
            CASE
                WHEN coalesce(p.previous_visits, 0) = 0 AND c.current_visits > 0 THEN 100.0
                WHEN coalesce(p.previous_visits, 0) = 0 THEN 0.0
                ELSE round(((c.current_visits - coalesce(p.previous_visits, 0)) * 100.0) / p.previous_visits, 2)
            END as visits_growth_percentage,
            CASE
                WHEN coalesce(p.previous_hits, 0) = 0 AND c.current_hits > 0 THEN 100.0
                WHEN coalesce(p.previous_hits, 0) = 0 THEN 0.0
                ELSE round(((c.current_hits - coalesce(p.previous_hits, 0)) * 100.0) / p.previous_hits, 2)
            END as hits_growth_percentage
        FROM current_period_data c
        LEFT JOIN previous_period_data p ON c.pathname = p.pathname
        ORDER BY c.current_visits DESC
        LIMIT {{ Int32(skip, 0) }}, {{ Int32(limit, 50) }}
        {% else %}
        SELECT
            pathname,
            current_visits as visits,
            current_hits as hits
        FROM current_period_data
        ORDER BY current_visits DESC
        LIMIT {{ Int32(skip, 0) }}, {{ Int32(limit, 50) }}
        {% end %}
      `,
    }),
  ],
  params: {
    date_from: p.string().optional().describe("Start date"),
    date_to: p.string().optional().describe("End date"),
    tenant_id: p.string().optional().describe("Filter by tenant ID"),
    domain: p.string().optional().describe("Filter by domain"),
    include_previous_period: p
      .string()
      .optional()
      .describe("Include previous period"),
    skip: p.int32().optional(0).describe("Skip for pagination"),
    limit: p.int32().optional(50).describe("Limit for pagination"),
  },
  output: {
    pathname: t.string(),
    visits: t.uint64(),
    hits: t.uint64(),
  },
});

export type TopPagesParams = InferParams<typeof topPages>;
export type TopPagesOutput = InferOutputRow<typeof topPages>;

/**
 * Top sources - traffic sources ordered by most visits
 */
export const topSources = defineEndpoint("top_sources", {
  description:
    "Top traffic sources ordered by most visits with optional previous period comparison",
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
                toDate(timestampAdd(today(), interval -7 day)) as current_start,
                toDate(today()) as current_end,
            {% end %}
            dateDiff('day', current_start, current_end) + 1 as period_days,
            timestampAdd(current_start, interval -period_days day) as previous_start,
            timestampAdd(current_end, interval -period_days day) as previous_end
        SELECT current_start, current_end, previous_start, previous_end, period_days
      `,
    }),
    node({
      name: "current_period_data",
      sql: `
        SELECT
            domainWithoutWWW(referrer) as referrer,
            uniqMerge(visits) as current_visits,
            countMerge(hits) as current_hits
        FROM analytics_sources_mv
        WHERE date >= (SELECT current_start FROM date_calculations)
            AND date <= (SELECT current_end FROM date_calculations)
            {% if defined(tenant_id) %}
            AND tenant_id = {{ String(tenant_id, description="Filter by tenant ID") }}
            {% end %}
            {% if defined(domain) %}
            AND domain = {{ String(domain, description="Filter by domain") }}
            {% end %}
        GROUP BY referrer
      `,
    }),
    node({
      name: "previous_period_data",
      sql: `
        {% if defined(include_previous_period) and include_previous_period == 'true' %}
        SELECT
            domainWithoutWWW(referrer) as referrer,
            uniqMerge(visits) as previous_visits,
            countMerge(hits) as previous_hits
        FROM analytics_sources_mv
        WHERE date >= (SELECT previous_start FROM date_calculations)
            AND date <= (SELECT previous_end FROM date_calculations)
            {% if defined(tenant_id) %}
            AND tenant_id = {{ String(tenant_id, description="Filter by tenant ID") }}
            {% end %}
            {% if defined(domain) %}
            AND domain = {{ String(domain, description="Filter by domain") }}
            {% end %}
        GROUP BY referrer
        {% else %}
        SELECT '' as referrer, 0 as previous_visits, 0 as previous_hits WHERE 1=0
        {% end %}
      `,
    }),
    node({
      name: "endpoint",
      sql: `
        {% if defined(include_previous_period) and include_previous_period == 'true' %}
        SELECT
            c.referrer,
            c.current_visits as visits,
            c.current_hits as hits,
            coalesce(p.previous_visits, 0) as previous_visits,
            coalesce(p.previous_hits, 0) as previous_hits,
            CASE
                WHEN coalesce(p.previous_visits, 0) = 0 AND c.current_visits > 0 THEN 100.0
                WHEN coalesce(p.previous_visits, 0) = 0 THEN 0.0
                ELSE round(((c.current_visits - coalesce(p.previous_visits, 0)) * 100.0) / p.previous_visits, 2)
            END as visits_growth_percentage,
            CASE
                WHEN coalesce(p.previous_hits, 0) = 0 AND c.current_hits > 0 THEN 100.0
                WHEN coalesce(p.previous_hits, 0) = 0 THEN 0.0
                ELSE round(((c.current_hits - coalesce(p.previous_hits, 0)) * 100.0) / p.previous_hits, 2)
            END as hits_growth_percentage
        FROM current_period_data c
        LEFT JOIN previous_period_data p ON c.referrer = p.referrer
        ORDER BY c.current_visits DESC
        LIMIT {{ Int32(skip, 0) }}, {{ Int32(limit, 50) }}
        {% else %}
        SELECT
            referrer,
            current_visits as visits,
            current_hits as hits
        FROM current_period_data
        ORDER BY current_visits DESC
        LIMIT {{ Int32(skip, 0) }}, {{ Int32(limit, 50) }}
        {% end %}
      `,
    }),
  ],
  params: {
    date_from: p.string().optional().describe("Start date"),
    date_to: p.string().optional().describe("End date"),
    tenant_id: p.string().optional().describe("Filter by tenant ID"),
    domain: p.string().optional().describe("Filter by domain"),
    include_previous_period: p
      .string()
      .optional()
      .describe("Include previous period"),
    skip: p.int32().optional(0).describe("Skip for pagination"),
    limit: p.int32().optional(50).describe("Limit for pagination"),
  },
  output: {
    referrer: t.string(),
    visits: t.uint64(),
    hits: t.uint64(),
  },
});

export type TopSourcesParams = InferParams<typeof topSources>;
export type TopSourcesOutput = InferOutputRow<typeof topSources>;
