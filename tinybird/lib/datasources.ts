/**
 * Tinybird Datasource Definitions
 */

import {
  defineDatasource,
  t,
  engine,
  type InferRow,
} from "@tinybirdco/sdk";

// ============================================================================
// Landing Datasource
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

// ============================================================================
// Materialized View Target Datasources
// ============================================================================

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
