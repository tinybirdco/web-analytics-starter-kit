# Web Analytics template for Tinybird

Build your own web analytics platform using [Tinybird](https://www.tinybird.co/)'s Events API and Endpoints. Built with privacy and speed as top priorities, this template lets you get real-time metrics in a pre-built dashboard in just a few minutes without any knowledge about Tinybird.

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

### Track web events

Add this snippet within your site `<head>` section:

```html
<script
  defer
  src="https://unpkg.com/@tinybirdco/flock.js"
  data-token="YOUR_TRACKER_TOKEN"
></script>
```

Get your `tracker` token from https://cloud.tinybird.co/tokens

If everything is working correctly, you should start receiving `page_hit` events as visitors view and interact with your website.

### Track custom events

The script also provides you with a function to track custom events. Add this to your application at any point:

```js
Tinybird.trackEvent('add_to_cart', {
  partnumber: 'A1708 (EMC 3164)',
  quantity: 1,
})
```

### Additional tracker parameters

These parameters can be used with the tracker snippet:

| Parameter         | Mandatory | Description                                                                                                                                                                                       |
| ----------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `data-token`      | Yes       | Your `tracker` token. It's already created for you, you can find it on the Tinybird UI under "Manage Auth Tokens"                                                                                 |
| `data-proxy`      | No        | Your domain URL to proxy the request, if you follow the optional steps for "GDPR Best Practices". Cannot be used together with `data-proxy-url`.                                                  |
| `data-proxy-url`  | No        | A complete proxy URL endpoint for the tracking request. Use this when you need to specify a custom tracking endpoint beyond just the domain. Cannot be used together with `data-proxy`.             |
| `data-host`       | No        | Tinybird host URL. Defaults to `https://api.tinybird.co/`, but could be `https://api.us-east.tinybird.co` or a dedicated cluster. The banner already generates the snippet with the proper host.  |
| `data-datasource` | No        | If you iterate the landing data source, or you just want to ingest the event in a different one, you can specify the landing data source name. 
| `web-vitals`      | No        | Tracks web vitals using the [web-vitals](https://www.npmjs.com/package/web-vitals) library 

### Implementing custom attributes

 Attributes name must have **data-tb\_** prefix. Every attribute included with this requirement would be saved in the payload column of your `analytics_events` datasource and will be included in every event. 
 
 For example:

```js
<script
  src="https://unpkg.com/@tinybirdco/flock.js"
  data-token="YOUR_TRACKER_TOKEN"
  data-tb-customer-id="CUSTOMER_ID"
></script>
```

Would append `"customer_id":"<CUSTOMER_ID>"` to the rest of variables saved in payload column.

Use custom attributes for multi-tenant support.

### Web vitals

Track web vitals like this:

```js
<script
  src="https://unpkg.com/@tinybirdco/flock.js"
  data-token="YOUR_TRACKER_TOKEN"
  web-vitals="true"
></script>
```

You'll start receiving events with `web_vital` action, the payload  looks like this:

```
{"name":"LCP","value":68,"delta":68,"id":"v3-1752067824029-4726354841567","pathname":"/","href":"http://localhost:8081/"}
{"name":"TTFB","value":41.10000002384186,"delta":41.10000002384186,"id":"v3-1752067821037-7353415626830","pathname":"/","href":"http://localhost:8081/"}
{"name":"FCP","value":120,"delta":120,"id":"v3-1752067821037-7485331818919","pathname":"/","href":"http://localhost:8081/"}
{"name":"INP","value":0,"delta":0,"id":"v3-1752067821037-7066346355405","pathname":"/","href":"http://localhost:8081/"}
{"name":"CLS","value":0,"delta":0,"id":"v3-1752067821037-6535975895510","pathname":"/","href":"http://localhost:8081/"}
```

These are the different metrics tracked and their meaning:

| Metric | What it Measures           | Your Value | Good Value   | Status     |
|--------|---------------------------|------------|--------------|------------|
| LCP    | Load performance          | 68 ms      | < 2500 ms    | Excellent  |
| TTFB   | Server responsiveness     | 41.1 ms    | < 500 ms     | Excellent  |
| FCP    | First contentful paint    | 120 ms     | < 1800 ms    | Excellent  |
| INP    | Interaction responsiveness| 0 ms       | < 200 ms     | No data    |
| CLS    | Visual stability          | 0          | < 0.1        | Perfect    |


## Visualize the metrics on a readymade dashboard

Go to https://analytics.tinybird.live and paste your **Workspace admin token**.

Get your `dashboard` token from https://cloud.tinybird.co/tokens.

## Advanced

### Local development

See the [tinybird](./tinybird/README.md) and [dashboard](./dashboard/README.md) READMEs.

1. Install the Tinybird CLI using `curl https://tinybird.co | bash`
2. Create a [Tinybird](https://tinybird.co) account and a workspace by running `tb login`
3. Clone this repository:

```bash
git clone https://github.com/tinybirdco/web-analytics-starter-kit
cd web-analytics-starter-kit/tinybird
```

4. Make changes to the `tinybird` project and deploy using `tb --cloud deploy`.

### Hosting your own dashboard on Vercel

If you want to customize & host your own dashboard, you can easily deploy the project to Vercel using the button below:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Ftinybirdco%2Fweb-analytics-starter-kit&project-name=tinybird-web-analytics-starter-kit&repository-name=tinybird-web-analytics-starter-kit&demo-title=Tinybird%20Web%20Analytics&demo-description=A%20privacy-first%20Web%20Analytics%20project%20built%20with%20Tinybird&demo-url=https%3A%2F%2Fanalytics.tinybird.co%2F&demo-image=//github.com/tinybirdco/web-analytics-starter-kit/blob/main/dashboard/public/banner.png?raw=true&root-directory=dashboard&integration-ids=oac_uoH2YyxhaS1H6UYvtuRbRbDY)

## GDPR

Tinybird is GDPR compliant as a platform, but it is your responsibility to follow GDPR's rules on data collection and consent when implementing your web analytics.

---

Need help?: [Community Slack](https://www.tinybird.co/join-our-slack-community) &bull; [Tinybird Docs](https://docs.tinybird.co/)
