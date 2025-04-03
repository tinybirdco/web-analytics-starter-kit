# Web Analytics template for Tinybird

Build your own web analytics platform using [Tinybird](https://www.tinybird.co/)'s Events API and Endpoints. Built with privacy and speed as top priorities, this template lets you get real-time metrics in a pre-built dashboard in just a few minutes without any knowledge about Tinybird. Our [free accounts](https://www.tinybird.co/pricing) serve up to 1000 requests per day and unlimited processed GB, more than enough to get started.

After you've finished the basic setup, expand your analytics with custom events tailored to your specific use cases (eCommerce, marketing, etc.), keeping the same real-time performance.

![Tinybird Web Analytics Dashboard](./assets/img/repo-banner.png)

## Get started

### Set up the data project

To deploy this template on Tinybird:

```bash
curl -sSL https://tinybird.co | bash
tb login
tb --cloud deploy --template https://github.com/tinybirdco/web-analytics-starter-kit/tree/main/tinybird
```

Follow the guided process, and your Tinybird workspace is now ready to start receiving events. All your Data Sources, [Materialized Views](https://www.tinybird.co/guide/materialized-views), and API Endpoints should be installed and ready. If you go to the **Data Flow** tab, you should see something like this:

![Data flow](./assets/img/data_flow.png)

### Send events to your data source

Copy the snippet from the banner and paste it within your site `<head>` section:

![Banner showed to copy HTML snippet](./assets/img/banner_snippet.png)

The snippet looks like this:

```html
<script
  defer
  src="https://unpkg.com/@tinybirdco/flock.js"
  data-token="YOUR_TRACKER_TOKEN"
></script>
```

If everything is working correctly, you should start seeing rows in your Data Source as visitors view and interact with your website:

![Incoming events](./assets/img/events-incoming.svg)

### Visualize the metrics on a readymade dashboard

Now you'll see a banner with a link to the dashboard. Click to open it:

![Analytics dashboard preview](./assets/img/banner_dashboard.png)

Alternatively, you can always navigate to https://analytics.tinybird.co/ and paste your `dashboard` token.

You'll find this `dashboard` token already created for you on the Tinybird UI, under **Manage Auth Tokens**.

## Advanced

### Local development and mock data

See the [tinybird](./tinybird/README.md) and [dashboard](./dashboard/README.md) READMEs.

### CLI installation of the Tinybird project

1. Install the Tinybird CLI using `curl https://tinybird.co | bash`
2. Create a [Tinybird](https://tinybird.co) account and a workspace by running `tb login`
3. Clone this repository:

```bash
git clone https://github.com/tinybirdco/web-analytics-starter-kit
cd web-analytics-starter-kit
cd tinybird
```

4. Deploy the project using `tb --cloud deploy`.

### Hosting your own dashboard on Vercel

If you want to customize & host your own dashboard, you can easily deploy the project to Vercel using the button below:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Ftinybirdco%2Fweb-analytics-starter-kit&project-name=tinybird-web-analytics-starter-kit&repository-name=tinybird-web-analytics-starter-kit&demo-title=Tinybird%20Web%20Analytics&demo-description=A%20privacy-first%20Web%20Analytics%20project%20built%20with%20Tinybird&demo-url=https%3A%2F%2Fanalytics.tinybird.co%2F&demo-image=//github.com/tinybirdco/web-analytics-starter-kit/blob/main/dashboard/public/banner.png?raw=true&root-directory=dashboard&integration-ids=oac_uoH2YyxhaS1H6UYvtuRbRbDY)


### Additional script parameters

These parameters can be used with the example tracker snippet:

| Parameter         | Mandatory | Description                                                                                                                                                                                       |
| ----------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `data-token`      | Yes       | Your `tracker` token. It's already created for you, you can find it on the Tinybird UI under "Manage Auth Tokens"                                                                                 |
| `data-proxy`      | No        | Your domain URL to proxy the request, if you follow the optional steps for "GDPR Best Practices"                                                                                                  |
| `data-host`       | No        | Tinybird host URL. Ddefaults to `https://api.tinybird.co/`, but could be `https://api.us-east.tinybird.co` or a dedicated cluster. The banner already generates the snippet with the proper host. |
| `data-datasource` | No        | If you iterate the landing data source, or you just want to ingest the event in a different one, you can specify the landing data source name. 

### Implementing custom events

The script also provides you with a function to send custom events. You can simply add this to your application at any point:

```js
Tinybird.trackEvent('add_to_cart', {
  partnumber: 'A1708 (EMC 3164)',
  quantity: 1,
})
```

You can also fork the dashboard project in this repository and create custom components for your new events. It's a Next.js project, so you can deploy it easily on [Vercel](https://vercel.com/).

### Implementing custom attributes

You can include custom attributes in the import library snippet. Attributes name must have **tb\_** prefix. Every attribute included with this requirement would be saved in the payload column of your analytics_events datasource and will be included in every event. For example:

```js
<script
  src="https://unpkg.com/@tinybirdco/flock.js"
  data-token="TOKEN-ID"
  tb_customer_id="CUSTOMER_ID"
></script>
```

Would append customer_id:CUSTOMER_ID to the rest of variables saved in payload column.

## GDPR

Tinybird is GDPR compliant as a platform, but it is your responsibility to follow GDPR's rules on data collection and consent when implementing your web analytics.

---

Need help?: [Community Slack](https://www.tinybird.co/join-our-slack-community) &bull; [Tinybird Docs](https://docs.tinybird.co/)
