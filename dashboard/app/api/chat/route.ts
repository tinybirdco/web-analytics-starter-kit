import { openai } from '@ai-sdk/openai'
import {
  streamText,
  tool,
  experimental_createMCPClient as createMCPClient,
} from 'ai'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'
import { z } from 'zod'

export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const token = new URL(req.headers.get('referer') ?? '').searchParams.get(
      'token'
    )
    const url = new URL('https://cloud.tinybird.co/mcp?token=' + token)

    const mcpClient = await createMCPClient({
      transport: new StreamableHTTPClientTransport(url, {
        sessionId: 'session_analytics_001',
      }),
    })

    const { messages } = await req.json()
    const tbTools = await mcpClient.tools()

    const result = streamText({
      model: openai('gpt-4o'),
      messages,
      maxSteps: 30,
      system: `
<context_prompt>
  you are a data analyst focused on mapping user questions to the most relevant Tinybird datasources (tables) and endpoints. your domain is web analytics: user behavior, engagement, performance, etc.

  tools available:
  - list_datasources() → returns all datasources (tables)
  - list_endpoints() → returns all endpoints
  - execute_query(sql) → runs a SQL query

  instructions:
  - analyze the user's question
  - select relevant datasources and/or endpoints needed to answer it
  - exclude unrelated sources unless unsure — in which case include them
  - limit to max 3 candidates if no source is specified
  - return:
    a) datasources: selected tables
    b) reasoning: short explanation of your selection
    c) sample_queries: suggest helpful SQL queries

  visualization rules:
  - never print raw query data
  - use only SqlChart (for numeric/time series) or PipeTable (for tabular)
  - always explain what you queried, what you found, and what's next before rendering
  - for single-value questions, (e.g. “how many X on day Y?”), if relevant, reply with a pair of
      1) the question with some context and conclusion about the data found
      2) a visualization that gives extra context about the trend or distribution
  - specific questions that potentially return a list (show me X grouped by Y / ordered by Z), please render either a pipetable or a sqlchart!!!!
  - e.g. when asked about visitors over the past 30 days, say the aggregate but show a chart of the daily users over said period as well!!!
  - whenever you feel like writing a markdown table or a markdown list to show some results DO NOT DO IT, render a pipetable tool component! wrangle the data if necessary to fit in the props but DO IT

  visualization formats:
  SqlChart:
  {
    "data": [...], 
    "xAxisKey": "date", 
    "yAxisKey": ["visits"], 
    "title": "Visitors Over Time"
  }

  PipeTable:
  {
    "data": [...], 
    "columns": [
      { "label": "Referrer", "key": "referrer" }
    ], 
    "title": "Top Referrers"
  }

  - data must be an array of objects with correct keys
  - use the exact key names from the response (e.g. snake_case)
  - reshape the data if needed before visualizing (but SqlChart and PipeTable accept as data what comes from Tinybird tools)
  
  after each visualization:
  - write a short 2-3 point summary in markdown
  - state what the data shows, and — if confident — what the answer is

  when selecting datasources/endpoints, consider:
  - names (table/column/endpoint) that match the question
  - types and sample values
  - descriptions
  - direct or contextual relevance
</context_prompt>
      .\n\nToday is ${new Date().toISOString().split('T')[0]}.`,
      tools: {
        ...tbTools,
        renderSqlChart: tool({
          description:
            'Render a time series or numeric chart using SqlChart. Pass the data (array of objects), xAxisKey (property for X axis, e.g. date), yAxisKey (property/properties for Y axis, numeric), and an optional title/unit. Data must be shaped as an array of objects with the correct keys.',
          parameters: z.object({
            data: z.array(z.record(z.string(), z.any())).default([]).nullish(),
            xAxisKey: z.string(),
            yAxisKey: z.union([z.string(), z.array(z.string())]),
            title: z.string().optional(),
            unit: z.string().optional(),
          }),
          execute: async ({ data, xAxisKey, yAxisKey, title, unit }) => ({
            data,
            xAxisKey,
            yAxisKey,
            title,
            unit,
          }),
        }),
        renderPipeTable: tool({
          description:
            'Render a table using PipeTable. Pass the data (array of objects), columns (array of {label, key}), and an optional title. Data must be shaped as an array of objects with the correct keys, and columns must match the data properties.',
          parameters: z.object({
            data: z.array(z.record(z.string(), z.any())),
            columns: z.array(z.object({ label: z.string(), key: z.string() })),
            title: z.string().optional(),
          }),
          execute: async ({ data, columns, title }) => ({
            data,
            columns,
            title,
          }),
        }),
      },
    })

    return result.toDataStreamResponse({
      getErrorMessage: error => {
        console.log('error', error)
        if (error == null) {
          return 'unknown error'
        }

        if (typeof error === 'string') {
          return error
        }

        if (error instanceof Error) {
          return error.message
        }

        return JSON.stringify(error)
      },
    })
  } catch (err) {
    console.log(err)
  }
}
