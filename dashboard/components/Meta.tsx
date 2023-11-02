import Head from 'next/head'
import config from '../lib/config'

const meta = {
  title: 'Web Analytics Dashboard  · Tinybird',
  description: 'Web Analytics Starter Kit built with Tinybird and Next.js',
  url: 'https://analytics.tinybird.co',
  image: `${config.dashboardURL}/banner.png`,
} as const

export default function Meta() {
  const { description, image, title, url } = meta

  return (
    <Head>
      <title>{title}</title>
      <link rel="icon" href="/favicon.ico" />
      <link rel="shortcut icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" sizes="180x180" href="/favicon.ico" />
      <meta name="theme-color" content="#0066FF" />

      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />

      <meta itemProp="name" content={title} />
      <meta itemProp="description" content={description} />
      <meta itemProp="image" content={image} />
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:type" content="website" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@Tinybirdco" />
      <meta name="twitter:creator" content="@StevenTey" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Head>
  )
}
