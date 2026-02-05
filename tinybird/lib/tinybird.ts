/**
 * Tinybird Web Analytics Definitions
 *
 * Migrated from web-analytics-starter-kit to TypeScript SDK
 */

import {
  defineDatasource,
  defineEndpoint,
  definePipe,
  defineMaterializedView,
  createTinybirdClient,
  node,
  t,
  p,
  engine,
  type InferRow,
  type InferParams,
  type InferOutputRow,
} from "@tinybirdco/sdk";

// ============================================================================
// Datasources
// ============================================================================

/**
 * Analytics events - landing data source for all analytics events
 */
export const analyticsEvents = defineDatasource("analytics_events", {
  description: "Analytics events landing data source",
  schema: {
    timestamp: t.dateTime(),
    session_id: t.string().nullable(),
    action: t.string().lowCardinality(),
    version: t.string().lowCardinality(),
    payload: t.string(),
    tenant_id: t.string().default(""),
    domain: t.string().default(""),
  },
  engine: engine.mergeTree({
    partitionKey: "toYYYYMM(timestamp)",
    sortingKey: ["tenant_id", "domain", "timestamp"],
  }),
});

export type AnalyticsEventsRow = InferRow<typeof analyticsEvents>;

/**
 * Analytics pages materialized view - aggregates page metrics
 */
export const analyticsPagesMv = defineDatasource("analytics_pages_mv", {
  jsonPaths: false,
  schema: {
    date: t.date(),
    tenant_id: t.string(),
    domain: t.string(),
    device: t.string(),
    browser: t.string(),
    location: t.string(),
    pathname: t.string(),
    visits: t.aggregateFunction("uniq", t.string()),
    hits: t.aggregateFunction("count", t.uint64()),
  },
  engine: engine.aggregatingMergeTree({
    partitionKey: "toYYYYMM(date)",
    sortingKey: ["tenant_id", "domain", "date", "device", "browser", "location", "pathname"],
  }),
});

/**
 * Analytics sessions materialized view - aggregates session metrics
 */
export const analyticsSessionsMv = defineDatasource("analytics_sessions_mv", {
  jsonPaths: false,
  schema: {
    date: t.date(),
    session_id: t.string(),
    tenant_id: t.string(),
    domain: t.string(),
    device: t.simpleAggregateFunction("any", t.string()),
    browser: t.simpleAggregateFunction("any", t.string()),
    location: t.simpleAggregateFunction("any", t.string()),
    first_hit: t.simpleAggregateFunction("min", t.dateTime()),
    latest_hit: t.simpleAggregateFunction("max", t.dateTime()),
    hits: t.aggregateFunction("count", t.uint64()),
  },
  engine: engine.aggregatingMergeTree({
    partitionKey: "toYYYYMM(date)",
    sortingKey: ["tenant_id", "domain", "date", "session_id"],
  }),
});

/**
 * Analytics sources materialized view - aggregates referrer/source metrics
 */
export const analyticsSourcesMv = defineDatasource("analytics_sources_mv", {
  jsonPaths: false,
  schema: {
    date: t.date(),
    tenant_id: t.string(),
    domain: t.string(),
    device: t.string(),
    browser: t.string(),
    location: t.string(),
    referrer: t.string(),
    visits: t.aggregateFunction("uniq", t.string()),
    hits: t.aggregateFunction("count", t.uint64()),
  },
  engine: engine.aggregatingMergeTree({
    partitionKey: "toYYYYMM(date)",
    sortingKey: ["tenant_id", "domain", "date", "device", "browser", "location", "referrer"],
  }),
});

/**
 * Tenant actions materialized view - tracks distinct actions by tenant
 */
export const tenantActionsMv = defineDatasource("tenant_actions_mv", {
  description: "Materialized datasource for storing distinct actions by tenant and domain",
  jsonPaths: false,
  schema: {
    tenant_id: t.string(),
    domain: t.string(),
    action: t.string(),
    last_payload: t.simpleAggregateFunction("any", t.string()),
    last_seen: t.simpleAggregateFunction("max", t.dateTime()),
    total_occurrences: t.aggregateFunction("count", t.uint64()),
  },
  engine: engine.aggregatingMergeTree({
    partitionKey: "toYYYYMM(last_seen)",
    sortingKey: ["tenant_id", "domain", "action"],
  }),
});

/**
 * Tenant domains materialized view - tracks domains per tenant
 */
export const tenantDomainsMv = defineDatasource("tenant_domains_mv", {
  description: "Materialized datasource for tracking domains per tenant",
  jsonPaths: false,
  schema: {
    tenant_id: t.string(),
    domain: t.string(),
    first_seen: t.simpleAggregateFunction("min", t.dateTime()),
    last_seen: t.simpleAggregateFunction("max", t.dateTime()),
    total_hits: t.aggregateFunction("count", t.uint64()),
  },
  engine: engine.aggregatingMergeTree({
    partitionKey: "toYYYYMM(last_seen)",
    sortingKey: ["tenant_id", "domain"],
  }),
});

// ============================================================================
// Internal Pipes (for materialization dependencies)
// ============================================================================

/**
 * Analytics hits - parsed page_hit events with browser/device detection
 */
export const analyticsHits = definePipe("analytics_hits", {
  description: "Parsed page_hit events with browser and device detection logic",
  nodes: [
    node({
      name: "parsed_hits",
      description: "Parse raw page_hit events",
      sql: `
        SELECT
            timestamp,
            action,
            version,
            coalesce(session_id, '0') as session_id,
            tenant_id,
            multiIf(domain != '', domain, current_domain != '', current_domain, domain_from_payload) as domain,
            JSONExtractString(payload, 'domain') as domain_from_payload,
            JSONExtractString(payload, 'locale') as locale,
            JSONExtractString(payload, 'location') as location,
            JSONExtractString(payload, 'referrer') as referrer,
            JSONExtractString(payload, 'pathname') as pathname,
            JSONExtractString(payload, 'href') as href,
            if(domainWithoutWWW(href) = '' and href is not null and href != '', URLHierarchy(href)[1], domainWithoutWWW(href)) as current_domain,
            lower(JSONExtractString(payload, 'user-agent')) as user_agent
        FROM analytics_events
        WHERE action = 'page_hit'
            {% if defined(tenant_id) %}
            AND tenant_id = {{ String(tenant_id, description="Filter by tenant ID") }}
            {% end %}
            {% if defined(domain) %}
            AND domain = {{ String(domain, description="Filter by domain") }}
            {% end %}
            {% if defined(from_date) %}
            AND timestamp >= {{ Date(from_date, description="Starting date for filtering", required=False) }}
            {% end %}
            {% if defined(to_date) %}
            AND timestamp <= {{ Date(to_date, description="Finishing date for filtering", required=False) }}
            {% end %}
        {% if defined(limit) %}
            LIMIT {{Int32(limit, 20)}}
            OFFSET {{Int32(page, 0) * Int32(limit, 20)}}
        {% end %}
      `,
    }),
    node({
      name: "endpoint",
      sql: `
        SELECT
            timestamp,
            action,
            version,
            session_id,
            tenant_id,
            domain,
            location,
            referrer,
            pathname,
            href,
            current_domain,
            case
                when match(user_agent, 'wget|ahrefsbot|curl|urllib|bitdiscovery|\\+https://|googlebot')
                then 'bot'
                when match(user_agent, 'android')
                then 'mobile-android'
                when match(user_agent, 'ipad|iphone|ipod')
                then 'mobile-ios'
                else 'desktop'
            END as device,
            case
                when match(user_agent, 'firefox')
                then 'firefox'
                when match(user_agent, 'chrome|crios')
                then 'chrome'
                when match(user_agent, 'opera')
                then 'opera'
                when match(user_agent, 'msie|trident')
                then 'ie'
                when match(user_agent, 'iphone|ipad|safari')
                then 'safari'
                else 'Unknown'
            END as browser
        FROM parsed_hits
      `,
    }),
  ],
});

// ============================================================================
// Materialization Pipes
// ============================================================================

/**
 * Analytics pages materialization pipe
 */
export const analyticsPages = defineMaterializedView("analytics_pages", {
  datasource: analyticsPagesMv,
  nodes: [
    node({
      name: "analytics_pages_1",
      description: "Aggregate by pathname and calculate session and hits",
      sql: `
        SELECT
            toDate(timestamp) AS date,
            tenant_id,
            domain,
            device,
            browser,
            location,
            pathname,
            uniqState(session_id) AS visits,
            countState() AS hits
        FROM analytics_hits
        GROUP BY date, tenant_id, domain, device, browser, location, pathname
      `,
    }),
  ],
});

/**
 * Analytics sessions materialization pipe
 */
export const analyticsSessions = defineMaterializedView("analytics_sessions", {
  datasource: analyticsSessionsMv,
  nodes: [
    node({
      name: "analytics_sessions_1",
      description: "Aggregate by session_id and calculate session metrics",
      sql: `
        SELECT
            toDate(timestamp) AS date,
            session_id,
            tenant_id,
            domain,
            anySimpleState(device) AS device,
            anySimpleState(browser) AS browser,
            anySimpleState(location) AS location,
            minSimpleState(timestamp) AS first_hit,
            maxSimpleState(timestamp) AS latest_hit,
            countState() AS hits
        FROM analytics_hits
        GROUP BY date, session_id, tenant_id, domain
      `,
    }),
  ],
});

/**
 * Analytics sources materialization pipe
 */
export const analyticsSources = defineMaterializedView("analytics_sources", {
  datasource: analyticsSourcesMv,
  nodes: [
    node({
      name: "analytics_sources_1",
      description: "Aggregate by referral and calculate session and hits",
      sql: `
        SELECT
            toDate(timestamp) AS date,
            tenant_id,
            domain,
            device,
            browser,
            location,
            referrer,
            uniqState(session_id) AS visits,
            countState() AS hits
        FROM analytics_hits
        WHERE domainWithoutWWW(referrer) != current_domain
        GROUP BY date, tenant_id, domain, device, browser, location, referrer
      `,
    }),
  ],
});

/**
 * Tenant actions materialization pipe
 */
export const tenantActions = defineMaterializedView("tenant_actions", {
  description: "Materializes distinct actions by tenant and domain",
  datasource: tenantActionsMv,
  nodes: [
    node({
      name: "tenant_actions_node",
      description: "Aggregate distinct actions per tenant/domain",
      sql: `
        with multiIf(domain != '', domain, current_domain != '', current_domain, domain_from_payload) as domain,
            JSONExtractString(payload, 'domain') as domain_from_payload,
            if(domainWithoutWWW(href) = '' and href is not null and href != '', URLHierarchy(href)[1], domainWithoutWWW(href)) as current_domain,
            JSONExtractString(payload, 'href') as href
        SELECT
            tenant_id,
            domain,
            action,
            anySimpleState(payload) AS last_payload,
            maxSimpleState(timestamp) AS last_seen,
            countState() AS total_occurrences
        FROM analytics_events
        GROUP BY tenant_id, domain, action
      `,
    }),
  ],
});

/**
 * Tenant domains materialization pipe
 */
export const tenantDomains = defineMaterializedView("tenant_domains", {
  description: "Materializes domain data from analytics hits",
  datasource: tenantDomainsMv,
  nodes: [
    node({
      name: "tenant_domains_node",
      description: "Aggregate domains per tenant with timestamps",
      sql: `
        SELECT
            tenant_id,
            domain,
            minSimpleState(timestamp) AS first_seen,
            maxSimpleState(timestamp) AS last_seen,
            countState() AS total_hits
        FROM analytics_hits
        GROUP BY tenant_id, domain
      `,
    }),
  ],
});

// ============================================================================
// Endpoints
// ============================================================================

/**
 * Current visitors - realtime visitor count
 */
export const currentVisitors = defineEndpoint("current_visitors", {
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
  description: "Returns domains for a tenant with first/last seen and total hits",
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
  description: "Get distinct action types with sample payload for each tenant/domain",
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
    include_previous_period: p.string().optional().describe("Include previous period comparison"),
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
 * Top browsers - ordered by most visits
 */
export const topBrowsers = defineEndpoint("top_browsers", {
  description: "Top browsers ordered by most visits with optional previous period comparison",
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
    include_previous_period: p.string().optional().describe("Include previous period"),
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
  description: "Top device types ordered by most visits with optional previous period comparison",
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
    include_previous_period: p.string().optional().describe("Include previous period"),
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
  description: "Top visiting countries ordered by most visits with optional previous period comparison",
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
    include_previous_period: p.string().optional().describe("Include previous period"),
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
    include_previous_period: p.string().optional().describe("Include previous period"),
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
  description: "Top traffic sources ordered by most visits with optional previous period comparison",
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
    include_previous_period: p.string().optional().describe("Include previous period"),
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

/**
 * Trend - realtime visits trend for last 30 minutes
 */
export const trend = defineEndpoint("trend", {
  description: "Visits trend over time for the last 30 minutes - great for realtime chart",
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
// Web Vitals Pipes
// ============================================================================

/**
 * Web vitals events - parsed web_vital events with metadata
 */
export const webVitalsEvents = definePipe("web_vitals_events", {
  description: "Parsed web_vital events with metadata lookup and metric extraction",
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
  description: "Current web vitals metrics with average values, scores, and descriptions",
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
  description: "Web vitals performance distribution with optional previous period comparison",
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
    include_previous_period: p.string().optional().describe("Include previous period"),
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

export type WebVitalsDistributionParams = InferParams<typeof webVitalsDistribution>;
export type WebVitalsDistributionOutput = InferOutputRow<typeof webVitalsDistribution>;

/**
 * Web vitals routes - routes with vitals scores
 */
export const webVitalsRoutes = defineEndpoint("web_vitals_routes", {
  description: "Routes with web vitals scores, sortable by performance",
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
    sort_order: p.string().optional().describe("'asc' for best, 'desc' for worst"),
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
export type WebVitalsTimeseriesOutput = InferOutputRow<typeof webVitalsTimeseries>;

// ============================================================================
// Client
// ============================================================================

export const tinybird = createTinybirdClient({
  datasources: {
    analyticsEvents,
    analyticsPagesMv,
    analyticsSessionsMv,
    analyticsSourcesMv,
    tenantActionsMv,
    tenantDomainsMv,
  },
  pipes: {
    // Internal pipes
    analyticsHits,
    analyticsPages,
    analyticsSessions,
    analyticsSources,
    tenantActions,
    tenantDomains,
    webVitalsEvents,
    // Endpoints
    currentVisitors,
    domain,
    domains,
    actions,
    kpis,
    topBrowsers,
    topDevices,
    topLocations,
    topPages,
    topSources,
    trend,
    webVitalsCurrent,
    webVitalsDistribution,
    webVitalsRoutes,
    webVitalsTimeseries,
  },
});
