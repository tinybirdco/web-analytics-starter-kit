import { rest } from 'msw'

export const data = {
  meta: [
    {
      name: 't',
      type: 'DateTime',
    },
    {
      name: 'visits',
      type: 'UInt64',
    },
  ],
  data: [
    {
      t: '2022-09-14 22:57:00',
      visits: 1,
    },
    {
      t: '2022-09-14 22:58:00',
      visits: 1,
    },
    {
      t: '2022-09-14 22:59:00',
      visits: 2,
    },
    {
      t: '2022-09-14 23:00:00',
      visits: 1,
    },
    {
      t: '2022-09-14 23:01:00',
      visits: 2,
    },
  ],
  rows: 30,
  statistics: {
    elapsed: 0.003924389,
    rows_read: 5137,
    bytes_read: 338977,
  },
}

// Define handlers that catch the corresponding requests and returns the mock data.
export const handlers = [
  rest.get('https://analytics-api.com/v0/pipes/trend.json', (_, res, ctx) => {
    return res(ctx.status(200), ctx.json(data))
  }),
]
