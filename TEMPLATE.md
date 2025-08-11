The Web Analytics template helps you set up your own web analytics platform using [Tinybird](https://www.tinybird.co/)'s Events API and Endpoints.

Built with privacy and speed as top priorities, this template lets you get real-time metrics in a pre-built dashboard in just a few minutes without any knowledge about Tinybird and extend it with custom events tailored to your specific use cases (eCommerce, marketing, etc.).

## Set up the project

Fork the GitHub repository and deploy the data project to Tinybird.

```bash
# select or create a new workspace
tb login

# deploy the template
tb --cloud deploy --template https://github.com/tinybirdco/web-analytics-starter-kit/tree/main/tinybird

# copy the dashboard token
tb --cloud token copy dashboard
```

[Deploy the dashboard](https://github.com/tinybirdco/web-analytics-starter-kit/blob/main/dashboard/README.md) to Vercel or use the hosted dashboard at https://analytics.tinybird.live/ using the Workspace `dashboard` [token](https://cloud.tinybird.co/tokens).


## Send events from your site

Copy the snippet and paste it within your site `<head>` section:

```html
<script
  defer
  src="https://unpkg.com/@tinybirdco/flock.js"
  data-token="TRACKER_TOKEN"
></script>
```

Get your `tracker` token from the [Tinybird dashboard](https://cloud.tinybird.co/tokens) or using the CLI:

```bash
tb --cloud token copy tracker && TRACKER_TOKEN=$(pbpaste)
```

Use the `data-host` attribute to set your Tinybird host URL. Defaults to `https://api.tinybird.co/`.

## Local development and mock data

See the [Tinybird](https://github.com/tinybirdco/web-analytics-starter-kit/blob/main/tinybird/README.md) and [dashboard](https://github.com/tinybirdco/web-analytics-starter-kit/blob/main/dashboard/README.md) READMEs.
