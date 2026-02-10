# Tinybird Web Analytics

A TypeScript-first data project for web analytics using the [Tinybird SDK](https://www.npmjs.com/package/@tinybirdco/sdk).

## Project Structure

```
tinybird/
├── src/
│   ├── client.ts             # Tinybird client configuration
│   ├── datasources.ts        # Datasource definitions
│   ├── endpoints.ts          # API endpoint definitions
│   ├── materializations.ts   # Materialized view definitions
│   ├── pipes.ts              # Internal pipe definitions
│   ├── tokens.ts             # Token definitions
│   ├── copies.ts             # Copy pipe definitions
│   └── web-vitals.ts         # Web vitals endpoints
├── tinybird.json             # SDK configuration
├── package.json
└── tsconfig.json
```

## Setup

```bash
cd tinybird
pnpm install
```

Configure your environment in `.env.local`:

```env
TINYBIRD_TOKEN=p.your_admin_token
TINYBIRD_HOST=https://api.tinybird.co
```

## Development

```bash
# Start development mode (watches for changes and syncs to a branch)
pnpm dev

# Build and push to a branch
pnpm build

# Deploy to production (main workspace)
pnpm deploy

# Preview changes without deploying
pnpm preview
```

## Using the Client

```typescript
import { tinybird } from './src/client';

// Type-safe queries with autocomplete
const result = await tinybird.query.kpis({
  date_from: new Date('2024-01-01'),
  date_to: new Date(),
  tenant_id: 'my-tenant'
});

// result.data is fully typed
```

## Resources

### Datasources

| Name | Description |
|------|-------------|
| `analyticsEvents` | Landing datasource for all analytics events |
| `analyticsPagesMv` | Aggregated page metrics |
| `analyticsSessionsMv` | Aggregated session metrics |
| `analyticsSourcesMv` | Aggregated referrer/source metrics |
| `tenantActionsMv` | Distinct actions by tenant |
| `tenantDomainsMv` | Domains per tenant |

### Endpoints

| Name | Description |
|------|-------------|
| `currentVisitors` | Real-time visitor count |
| `kpis` | Key performance indicators |
| `trend` | Traffic trends over time |
| `topPages` | Most visited pages |
| `topSources` | Top traffic sources |
| `topBrowsers` | Browser breakdown |
| `topDevices` | Device breakdown |
| `topLocations` | Geographic breakdown |
| `domain` | Primary domain |
| `domains` | All tracked domains |
| `actions` | Tracked actions |

### Web Vitals Endpoints

| Name | Description |
|------|-------------|
| `webVitalsCurrent` | Current web vitals metrics |
| `webVitalsDistribution` | Distribution of web vitals scores |
| `webVitalsRoutes` | Web vitals by route |
| `webVitalsTimeseries` | Web vitals over time |

## Configuration

The `tinybird.json` configures the SDK:

```json
{
  "include": [
    "src/client.ts",
    "src/datasources.ts",
    "src/endpoints.ts",
    "src/materializations.ts",
    "src/pipes.ts",
    "src/tokens.ts",
    "src/copies.ts",
    "src/web-vitals.ts"
  ],
  "token": "${TINYBIRD_TOKEN}",
  "baseUrl": "${TINYBIRD_HOST}",
  "devMode": "branch"
}
```

## Learn More

- [Tinybird SDK Documentation](https://www.npmjs.com/package/@tinybirdco/sdk)
- [Tinybird Documentation](https://www.tinybird.co/docs)
