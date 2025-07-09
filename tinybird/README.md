# Tinybird Data Project

## Project description

```bash
├── datasources
│   └── analytics_events.datasource
├── endpoints
│   ├── analytics_hits.pipe
│   ├── kpis.pipe
│   ├── top_browsers.pipe
│   ├── top_devices.pipe
│   ├── top_locations.pipe
│   ├── top_pages.pipe
│   └── top_sources.pipe
├── materializations
│   ├── analytics_pages.pipe
│   ├── analytics_sessions.pipe
│   └── analytics_sources.pipe
```

In the `/datasources` folder:
- analytics_events.datasource: Contains events from the `tracker` script (flock.js). Each event has a different `action` (e.g. `page_hit`, `add_to_cart`, `web_vital`) and payload

In the `/endpoints` folder:
- analytics_hits: Parse `page_hit` events, extract attributes from `payload` and publish them, so they can be used in multiple use cases.
- kpis: Summary including general KPIs per date
- top_browsers: Browser level metrics
- top_devices: Device level metrics
- top_locations: Location (country) level metrics
- top_pages: Path and browser level metrics
- top_sources: Referral and browser level metrics

In the `/materializations` folder, including materialized views:
- analytics_pages: Aggregate by pathname and calculate session and hits
- analytics_sessions: Aggregate by session_id and calculate session metrics
- analytics_sources: Aggregate by referral and calculate session and hits

## Local development

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


## Cloud deployment

After validating your changes use `tb --cloud deploy`
