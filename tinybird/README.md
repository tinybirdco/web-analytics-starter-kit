# Tinybird Data Project

## Project structure

```
web-analytics-starter-kit/tinybird/
├── lib
│   └── tinybird.ts           # TypeScript SDK definitions
├── datasources               # Legacy .datasource files
│   ├── analytics_events.datasource
│   ├── analytics_pages_mv.datasource
│   ├── analytics_sessions_mv.datasource
│   └── analytics_sources_mv.datasource
├── endpoints                 # Legacy .pipe files
│   ├── analytics_hits.pipe
│   ├── current_visitors.pipe
│   ├── domain.pipe
│   ├── kpis.pipe
│   ├── top_browsers.pipe
│   ├── top_devices.pipe
│   ├── top_locations.pipe
│   ├── top_pages.pipe
│   ├── top_sources.pipe
│   └── trend.pipe
├── materializations
│   ├── analytics_pages.pipe
│   ├── analytics_sessions.pipe
│   └── analytics_sources.pipe
├── web_vitals
│   └── endpoints/
├── fixtures
│   ├── analytics_events.ndjson
│   └── analytics_events.sql
├── package.json
├── tinybird.json
├── tsconfig.json
└── README.md
```

## TypeScript SDK (Recommended)

This project now supports the **Tinybird TypeScript SDK** for fully-typed datasource and endpoint definitions.

### Setup

```bash
cd tinybird
npm install
```

### Development

```bash
# Start development mode with hot reload
npm run dev

# Build and deploy to a branch
npm run build

# Deploy to production
npm run deploy
```

### Benefits

- **Full type safety** for datasources, pipes, and endpoints
- **IntelliSense** for params and output types
- **Single source of truth** - all definitions in `lib/tinybird.ts`
- **Automatic generation** of .datasource and .pipe files

### Resources Defined

The `lib/tinybird.ts` file defines:

**Datasources (6):**
- `analyticsEvents` - Landing data source for all analytics events
- `analyticsPagesMv` - Aggregated page metrics
- `analyticsSessionsMv` - Aggregated session metrics
- `analyticsSourcesMv` - Aggregated referrer/source metrics
- `tenantActionsMv` - Distinct actions by tenant
- `tenantDomainsMv` - Domains per tenant

**Materialized Views (5):**
- `analyticsPages`, `analyticsSessions`, `analyticsSources`, `tenantActions`, `tenantDomains`

**Endpoints (14):**
- `currentVisitors`, `domain`, `domains`, `actions`, `kpis`
- `topBrowsers`, `topDevices`, `topLocations`, `topPages`, `topSources`
- `trend`, `webVitalsCurrent`, `webVitalsDistribution`, `webVitalsRoutes`, `webVitalsTimeseries`

### Using Types in Your App

```typescript
import {
  tinybird,
  type KpisParams,
  type KpisOutput,
  type TopPagesParams,
  type TopPagesOutput
} from './lib/tinybird';

// Query with full type safety
const result = await tinybird.pipes.kpis.query({
  date_from: '2024-01-01',
  date_to: '2024-01-31',
  tenant_id: 'my-tenant'
});
```

---

## Legacy CLI Approach

You can still use the traditional Tinybird CLI with `.datasource` and `.pipe` files.

### Local development

```bash
# install the tinybird CLI
curl https://tinybird.co | sh

tb local start

# select or create a new workspace
tb login

tb dev
tb token ls  # copy the local admin token
```

Use `http://localhost:7181` as NEXT_PUBLIC_TINYBIRD_HOST and the admin token in the [dashboard](../dashboard/README.md).

### Cloud deployment

After validating your changes use `tb --cloud deploy`

---

## Project description

The Tinybird data project for web analytics includes datasources, endpoints, and materializations to power analytics dashboards and APIs. The main datasource, `analytics_events`, collects events from the tracker script. Endpoints provide parsed and aggregated analytics, and materializations enable efficient querying for dashboards.

`web_vitals` metrics are stored in `analytics_events` with `action=web_vital`. See `web_vitals` folder for example endpoints.
