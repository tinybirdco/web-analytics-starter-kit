# Dashboard Starter Kit

This is a tool to consume the pipes and visualize all the events that has been sent to your data project.

## Tech stack

To build this Starter Kit template we have used:

- [Next.js](https://nextjs.org/) with [React](https://reactjs.org/) v18 as a framework
- [Vercel](https://vercel.com/) as deployment system
- [Tailwind](https://tailwindcss.com/) with theme configuration for CSS styling
- [SWR](https://swr.vercel.app/es-ES) for data fetching

## How to use it?

### Install

First of all, you have to clone the repo if you haven't already

```bash
git clone git@github.com:tinybirdco/web-analytics-starter-kit.git
```

Then navigate into the `/dashboard` folder and install the dependencies

```bash
cd web-analytics-starter-kit/dashboard
pnpm install
```

### Build for Development

Once you have installed the dependencies, run:

```bash
pnpm dev
```

You will find the app running at http://localhost:3000

Copy the .env.example file and rename it to .env.

```bash
# Tinybird Configuration (server-only, required)
TINYBIRD_TOKEN=your-tinybird-token
TINYBIRD_HOST=https://api.tinybird.co

# Dashboard URL (public)
NEXT_PUBLIC_TINYBIRD_DASHBOARD_URL=http://localhost:3000

# Tracker token for analytics (public, optional)
NEXT_PUBLIC_TINYBIRD_TRACKER_TOKEN=

# Dashboard Basic Auth (server-only, defaults to admin/admin if not set)
# DASHBOARD_USERNAME=admin
# DASHBOARD_PASSWORD=changeme

# Optional: Set to "true" to disable auth during development
DISABLE_AUTH=false

# Optional: AI Chat
NEXT_PUBLIC_ASK_TINYBIRD_ENDPOINT="https://ask-tb.tinybird.live/api/chat"
```

To develop locally, start [Tinybird Local](https://www.tinybird.co/docs/cli/local-container) and use `http://localhost:7181` as TINYBIRD_HOST.

### Authentication

The dashboard includes built-in authentication. By default, credentials are `admin/admin`. You can customize this by setting `DASHBOARD_USERNAME` and `DASHBOARD_PASSWORD` environment variables.

For local development, you can disable authentication by setting `DISABLE_AUTH=true`.

### Build for Production

```bash
pnpm build
```

```bash
pnpm start
```

And you will find the app running with the production bundle at http://localhost:3000

### Deployment

Deploy it to the cloud with [Vercel](https://vercel.com/new?utm_source=github&utm_medium=readme&utm_campaign=next-example) ([Documentation](https://nextjs.org/docs/deployment)).

## Contributing

Contributions are always welcome. To contribute, commit your changes into a new branch, and open a pull request against the main branch.

Please be careful in describing the problem and the implemented solution so that we can make the best review possible.

### Issues

Also, you can [open an issue](https://github.com/tinybirdco/web-analytics-starter-kit/issues) if you've encountered a bug or an enhancement on the Dashboard.

## Customization

We encourage you to [fork](https://docs.github.com/es/get-started/quickstart/fork-a-repo) the repo and customize the dashboard adapting it to your needs and to your branding image.

## Licence

MIT License

Copyright (c) 2022 Tinybird.co

Permission is hereby granted, free of charge, to any person obtaining a copy
