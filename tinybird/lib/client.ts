/**
 * Tinybird Client
 *
 * Creates a typed client for querying Tinybird endpoints.
 * This can be imported from other packages in the monorepo.
 */

import { createTinybirdClient } from "@tinybirdco/sdk";

// Datasources
import {
  analyticsEvents,
  analyticsPagesMv,
  analyticsSessionsMv,
  analyticsSourcesMv,
  tenantActionsMv,
  tenantDomainsMv,
} from "./datasources";

// Internal Pipes
import { analyticsHits } from "./pipes";

// Materializations
import {
  analyticsPages,
  analyticsSessions,
  analyticsSources,
  tenantActions,
  tenantDomains,
} from "./materializations";

// Endpoints
import {
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
} from "./endpoints";

// Web Vitals
import {
  webVitalsEvents,
  webVitalsCurrent,
  webVitalsDistribution,
  webVitalsRoutes,
  webVitalsTimeseries,
} from "./web-vitals";

/**
 * All datasources defined in this project
 */
export const datasources = {
  analyticsEvents,
  analyticsPagesMv,
  analyticsSessionsMv,
  analyticsSourcesMv,
  tenantActionsMv,
  tenantDomainsMv,
};

/**
 * All pipes (internal + materializations + endpoints) defined in this project
 */
export const pipes = {
  // Internal pipes
  analyticsHits,
  // Materializations
  analyticsPages,
  analyticsSessions,
  analyticsSources,
  tenantActions,
  tenantDomains,
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
  // Web vitals resources
  webVitalsEvents,
  webVitalsCurrent,
  webVitalsDistribution,
  webVitalsRoutes,
  webVitalsTimeseries,
};

/**
 * Create a Tinybird client with custom configuration
 */
export function createAnalyticsClient(config: {
  token: string;
  baseUrl?: string;
}) {
  return createTinybirdClient({
    ...config,
    datasources,
    pipes,
  });
}

/**
 * Type for the analytics client
 */
export type AnalyticsClient = ReturnType<typeof createAnalyticsClient>;

// Re-export types for convenience
export type {
  CurrentVisitorsParams,
  CurrentVisitorsOutput,
  DomainOutput,
  DomainsParams,
  DomainsOutput,
  ActionsParams,
  ActionsOutput,
  KpisParams,
  KpisOutput,
  TrendParams,
  TrendOutput,
  TopBrowsersParams,
  TopBrowsersOutput,
  TopDevicesParams,
  TopDevicesOutput,
  TopLocationsParams,
  TopLocationsOutput,
  TopPagesParams,
  TopPagesOutput,
  TopSourcesParams,
  TopSourcesOutput,
} from "./endpoints";

export type {
  WebVitalsCurrentParams,
  WebVitalsCurrentOutput,
  WebVitalsDistributionParams,
  WebVitalsDistributionOutput,
  WebVitalsRoutesParams,
  WebVitalsRoutesOutput,
  WebVitalsTimeseriesParams,
  WebVitalsTimeseriesOutput,
} from "./web-vitals";

export type { AnalyticsEventsRow } from "./datasources";
