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
├── pipes
│   ├── analytics_pages.pipe
│   ├── analytics_sessions.pipe
│   └── analytics_sources.pipe
```

In the `/datasources` folder:
- analytics_events.datasource: 

In the `/endpoints` folder:
- analytics_hits: Parse page_hit events and publish them, so they can be used in multiple use cases.
- kpis: Summary including general KPIs per date
- top_browsers: Browser level metrics
- top_devices: Device level metrics
- top_locations: Location (country) level metrics
- top_pages: Path and browser level metrics
- top_sources: Referral and browser level metrics

In the `/pipes` folder, including materialized views:
- analytics_pages: Aggregate by pathname and calculate session and hits
- analytics_sessions: Aggregate by session_id and calculate session metrics
- analytics_sources: Aggregate by referral and calculate session and hits

Note:
Typically, in big projects, we split the .pipe files across two folders: /pipes and /endpoints
- `/pipes` where we store the pipes ending in a datasource, that is, [materialized views](https://guides.tinybird.co/guide/materialized-views)
- `/endpoints` for the pipes that end in API endpoints. 
