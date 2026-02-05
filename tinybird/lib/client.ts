/**
 * Tinybird Client
 *
 * Typed client for querying and ingesting data
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
} from "./datasources.js";

// Internal Pipes
import { analyticsHits } from "./pipes.js";

// Materializations
import {
  analyticsPages,
  analyticsSessions,
  analyticsSources,
  tenantActions,
  tenantDomains,
} from "./materializations.js";

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
  webVitalsEvents,
  webVitalsCurrent,
  webVitalsDistribution,
  webVitalsRoutes,
  webVitalsTimeseries,
} from "./endpoints.js";

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
    // Materializations
    analyticsPages,
    analyticsSessions,
    analyticsSources,
    tenantActions,
    tenantDomains,
    // Internal pipe for web vitals
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
