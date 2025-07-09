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
  const token = new URL(req.headers.get('referer') ?? '').searchParams.get(
    'token'
  )
  const url = new URL('https://cloud.tinybird.co/mcp?token=' + token)

  const mcpClient = await createMCPClient({
    transport: new StreamableHTTPClientTransport(url, {
      sessionId: 'session_analytics_001',
    }),
  })

  console.log('tus muertos', req.headers)

  const { messages } = await req.json()
  const tbTools = await mcpClient.tools()

  const result = streamText({
    model: openai('gpt-4o'),
    messages,
    maxSteps: 5,
    system: `You are an analytics assistant for web analytics data. Your job is to help users explore and visualize their website analytics using Tinybird data.\n\nWorkflow:\n1. Use the list_endpoints and list_datasources tools from Tinybird to explore available resources.\n2. Use generateSqlQuery to create SQL queries for the user's question.\n3. Use the tinybird SQL tool or endpoint tool to run the query and get the data.\n4. If the data is time series or numeric, return it in a format suitable for SqlChart. If it is tabular, return it for PipeTable.\n5. When responding, use a tool call to indicate which visualization to render (SqlChart or PipeTable) and pass the data.\n\n**IMPORTANT:**\n- For SqlChart: Return an array of objects as 'data', and specify 'xAxisKey' (the property for the X axis, usually a date, time, or category) and 'yAxisKey' (the property or properties for the Y axis, numeric). Example: { data: [...], xAxisKey: 'date', yAxisKey: 'visits', title: 'Visitors' }\n- For PipeTable: Return an array of objects as 'data', and provide a 'columns' array with objects like { label: 'Column Name', key: 'property_name' }. Example: { data: [...], columns: [{label: 'Referrer', key: 'referrer'}, ...], title: 'Top Referrers' }\n- Always ensure the data is an array of objects, with keys matching the columns or axes you specify.\n- If the Tinybird response uses snake_case or other naming, use those exact keys in your tool call.\n- If the data is not in the right shape, transform it (e.g., rename keys, aggregate, etc.) before passing to the tool.\n\nDo not generate or send emails. Do not use any email/template tools.\n\nToday is ${new Date().toISOString().split('T')[0]}.`,
    tools: {
      ...tbTools,
      renderSqlChart: tool({
        description:
          'Render a time series or numeric chart using SqlChart. Pass the data (array of objects), xAxisKey (property for X axis, e.g. date), yAxisKey (property/properties for Y axis, numeric), and an optional title/unit. Data must be shaped as an array of objects with the correct keys.',
        parameters: z.object({
          data: z.array(z.record(z.string(), z.any())),
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

  return result.toDataStreamResponse()
}
