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
import { createAnalyticsClient } from './src/client';

// Initialize the client
const tinybird = createAnalyticsClient();

// Type-safe requests with autocomplete
const result = await tinybird.query.kpis({
  date_from: new Date('2024-01-01'),
  date_to: new Date(),
  tenant_id: 'my-tenant'
});

// result.data is fully typed
```

## Resources

### Datasources

| Resource Name | Description |
|---------------|-------------|
| `analytics_events` | Landing datasource for all analytics events |
| `analytics_pages_mv` | Aggregated page metrics |
| `analytics_sessions_mv` | Aggregated session metrics |
| `analytics_sources_mv` | Aggregated referrer/source metrics |
| `tenant_actions_mv` | Distinct actions by tenant |
| `tenant_domains_mv` | Domains per tenant |

### Materialized Views

| Resource Name | Target Datasource |
|---------------|-------------------|
| `analytics_pages` | `analytics_pages_mv` |
| `analytics_sessions` | `analytics_sessions_mv` |
| `analytics_sources` | `analytics_sources_mv` |
| `tenant_actions` | `tenant_actions_mv` |
| `tenant_domains` | `tenant_domains_mv` |

### Endpoints

| Resource Name | Description |
|---------------|-------------|
| `current_visitors` | Real-time visitor count |
| `kpis` | Key performance indicators |
| `trend` | Traffic trends over time |
| `top_pages` | Most visited pages |
| `top_sources` | Top traffic sources |
| `top_browsers` | Browser breakdown |
| `top_devices` | Device breakdown |
| `top_locations` | Geographic breakdown |
| `domain` | Primary domain |
| `domains` | All tracked domains |
| `actions` | Tracked actions |

### Web Vitals Endpoints

| Resource Name | Description |
|---------------|-------------|
| `web_vitals_current` | Current web vitals metrics |
| `web_vitals_distribution` | Distribution of web vitals scores |
| `web_vitals_routes` | Web vitals by route |
| `web_vitals_timeseries` | Web vitals over time |

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
