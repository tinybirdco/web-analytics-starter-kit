/**
 * Tinybird Internal Pipe Definitions
 */

import {
  defineEndpoint,
  node,
  t,
  p,
  type InferParams,
  type InferOutputRow,
} from "@tinybirdco/sdk";
import { dashboardToken } from "./tokens";

/**
 * Analytics hits - parsed page_hit events with browser/device detection
 */
export const analyticsHits = defineEndpoint("analytics_hits", {
  description:
    "Parsed page_hit events with browser and device detection logic. Use like_filter for arbitrary text filter over the payload column.",
  tokens: [{ token: dashboardToken, scope: "READ" }],
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
            {% if defined(like_filter) %}
            AND payload like {{ String(like_filter, description="Filter to apply to the payload JSON string", example="%utm_%") }}
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
  params: {
    tenant_id: p.string().optional().describe("Filter by tenant ID"),
    domain: p.string().optional().describe("Filter by domain"),
    from_date: p.date().optional().describe("Starting date for filtering"),
    to_date: p.date().optional().describe("Finishing date for filtering"),
    like_filter: p
      .string()
      .optional()
      .describe("Filter to apply to the payload JSON string"),
    limit: p.int32().optional(20).describe("Limit for pagination"),
    page: p.int32().optional(0).describe("Page number for pagination"),
  },
  output: {
    timestamp: t.dateTime(),
    action: t.string(),
    version: t.string(),
    session_id: t.string(),
    tenant_id: t.string(),
    domain: t.string(),
    location: t.string(),
    referrer: t.string(),
    pathname: t.string(),
    href: t.string(),
    current_domain: t.string(),
    device: t.string(),
    browser: t.string(),
  },
});

export type AnalyticsHitsParams = InferParams<typeof analyticsHits>;
export type AnalyticsHitsOutput = InferOutputRow<typeof analyticsHits>;
