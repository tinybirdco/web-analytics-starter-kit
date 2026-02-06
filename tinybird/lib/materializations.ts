/**
 * Tinybird Materialized View Definitions
 */

import { defineMaterializedView, node } from "@tinybirdco/sdk";
import {
  analyticsPagesMv,
  analyticsSessionsMv,
  analyticsSourcesMv,
  tenantActionsMv,
  tenantDomainsMv,
} from "./datasources";

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
