Build your own web analytics platform using [Tinybird](https://www.tinybird.co/)'s Events API and Endpoints.

Built with privacy and speed as top priorities, this Starter Kit lets you get real-time metrics in a pre-built dashboard in just a few minutes without any knowledge about Tinybird and extend it with custom events tailored to your specific use cases (eCommerce, marketing, etc.).

## 1. Set up the project

Fork the GitHub repository and deploy the data project to Tinybird.

[Deploy the dashboard](https://github.com/tinybirdco/web-analytics-starter-kit/blob/main/dashboard/README.md) to Vercel or use the hosted dashboard at https://analytics.tinybird.co/ using the Workspace `dashboard` token.

## 2. Send events from your site

Copy the snippet and paste it on your site `<head>`

```html
<script
  defer
  src="https://unpkg.com/@tinybirdco/flock.js"
  data-token="YOUR_TRACKER_TOKEN"
></script>
```

Script parameters:

| Parameter         | Mandatory | Description                                                                                                                                                                                       |
| ----------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `data-token`      | Yes       | Your `tracker` token. It's already created for you, you can find it on the Tinybird UI under "Manage Auth Tokens"                                                                                 |
| `data-proxy`      | No        | Your domain URL to proxy the request, if you follow the optional steps for "GDPR Best Practices"                                                                                                  |
| `data-host`       | No        | Tinybird host URL. Ddefaults to `https://api.tinybird.co/`, but could be `https://api.us-east.tinybird.co` or a dedicated cluster. The banner already generates the snippet with the proper host. |
| `data-datasource` | No        | If you iterate the landing data source, or you just want to ingest the event in a different one, you can specify the landing data source name.                                                    |

## 3. Learn more

To learn more about the Web Analytics Starter Kit, local development and more, check out the [README](https://github.com/tinybirdco/web-analytics-starter-kit/blob/main/README.md).

## 4. Support

If you have any questions or need help, please reach out to us on [Slack](https://www.tinybird.co/join-our-slack-community) or [email](mailto:support@tinybird.co).

