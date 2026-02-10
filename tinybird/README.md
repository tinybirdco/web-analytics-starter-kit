# Tinybird Data Project

## Project structure

```
web-analytics-starter-kit/tinybird/
├── src/                      # TypeScript SDK definitions
│   ├── client.ts             # Tinybird client configuration
│   ├── datasources.ts        # Datasource definitions
│   ├── endpoints.ts          # Endpoint definitions
│   ├── materializations.ts   # Materialized view definitions
│   ├── pipes.ts              # Pipe definitions
│   ├── tokens.ts             # Token definitions
│   ├── copies.ts             # Copy definitions
│   └── web-vitals.ts         # Web vitals endpoints
├── package.json
├── tinybird.json
├── tsconfig.json
└── README.md
```

## TypeScript SDK (Recommended)

This project uses the **Tinybird TypeScript SDK** for fully-typed datasource and endpoint definitions.

### Setup

```bash
cd tinybird
pnpm install
```

### Development

```bash
# Start development mode with hot reload
pnpm dev

# Build and deploy to a branch
pnpm build

# Deploy to production
pnpm deploy
```

### Benefits

- **Full type safety** for datasources, pipes, and endpoints
- **IntelliSense** for params and output types
- **Single source of truth** - all definitions in `src/`
- **Automatic generation** of .datasource and .pipe files

### Resources Defined

The `src/` directory defines:

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
import { kpis, topPages } from './src/endpoints';

// Query with full type safety
const result = await kpis({
  date_from: '2024-01-01',
  date_to: '2024-01-31',
  tenant_id: 'my-tenant'
});
```

---

## Local development

```bash
# Install the Tinybird CLI
curl https://tinybird.co | sh

# Start local Tinybird
tb local start

# Login and select a workspace
tb login

# Start development mode (watches for changes)
pnpm dev

# Get your local admin token
tb token ls
```

Use `http://localhost:7181` as `TINYBIRD_HOST` and the admin token in the [dashboard](../dashboard/README.md).

### Cloud deployment

After validating your changes use `pnpm deploy` or `tb --cloud deploy`.

---

## Project description

The Tinybird data project for web analytics includes datasources, endpoints, and materializations to power analytics dashboards and APIs. The main datasource, `analytics_events`, collects events from the tracker script. Endpoints provide parsed and aggregated analytics, and materializations enable efficient querying for dashboards.

`web_vitals` metrics are stored in `analytics_events` with `action=web_vital`. See `src/web-vitals.ts` for web vitals endpoints.
