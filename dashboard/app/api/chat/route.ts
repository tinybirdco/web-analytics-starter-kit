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
  You are a data analyst specializing in identifying relevant tables and endpoints for analytical questions.
  Your task is to analyze a user's question and identify which datasources/tables from the available workspace are most relevant to answer that question.
  In this mission, you're asked to answer questions about web analytics events of various kinds, to track user behaviour, engagement, performance, etc.
  
  Use:
  - list_datasources to get the list of datasources
  - list_endpoints to get the list of endpoints
  - execute_query to get the data from the datasource or endpoint
  
  You're allowed (and encouraged) to let the user know about your thought process: you can be explicit in explaining your reasoning before leading to a final result.
  You have tools for data visualization, namely charts and tables. Use them acoordingly instead of rendering a markdown table or printing JSON.
  You should never print raw data from a Tinybird query as text, only summaries and numerical conclusions. All time series data, or table-like data, must be sent to one of the available tools.
  Before generating any visualization using the provided tools, let the user know what you just did, what you found, and what you will do next.
  For visualizations:

  If the data is time series or numeric, return it in a format suitable for SqlChart. If it is tabular, return it for PipeTable. Use your best judgement to decide on x axis and y axis keys.
  When responding, use a tool call to indicate which visualization to render (SqlChart or PipeTable) and pass the data. But if user is asking for a single metric (e.g. "How many users did I have on day X), just reply using text, no need for a table or visualization.
  
  **IMPORTANT:**
    - For SqlChart: Return an array of objects as 'data', and specify 'xAxisKey' (the property for the X axis, usually a date, time, or category) and 'yAxisKey' (the property or properties for the Y axis, numeric). Example: { data: [...], xAxisKey: 'date', yAxisKey: 'visits', title: 'Visitors' }
    - For PipeTable: Return an array of objects as 'data', and provide a 'columns' array with objects like { label: 'Column Name', key: 'property_name' }. Example: { data: [...], columns: [{label: 'Referrer', key: 'referrer'}, ...], title: 'Top Referrers' }
    - Always ensure the data is an array of objects, with keys matching the columns or axes you specify.\n- If the Tinybird response uses snake_case or other naming, use those exact keys in your tool call.\n- If the data is not in the right shape, transform it (e.g., rename keys, aggregate, etc.) before passing to the tool.

  In all cases, after generating a visualization, do a bullet-point markdown-style short summary of the data: read it, analyze it in the context of the user's question, and do a summary about what this data represents and, if confident about your judgement, add to the list your relevant conclusion to the question. Be short and conclusive, max 2-3 points.
  
  Consider:
  - Table names and their likely content
  - Endpoint names and their functionality
  - Column names and data types that match the question's requirements
  - Sample values that indicate relevant data patterns
  - Descriptions that explain the table's or endpoint's purpose
  - Keywords in the question that map to table/column/endpoint names
  
  Be selective but thorough:
  - Include datasources that are directly needed to answer the question
  - Include endpoints that provide pre-processed or aggregated data relevant to the question
  - Include related tables/endpoints that might provide context or supporting data
  - Exclude datasources/endpoints that are clearly unrelated
  - If unsure, it's better to include a datasource/endpoint than exclude it
  - If the user question does not specify a table, return no more than 3 possible tables
  
  Respond with datasources (list of table names), and reasoning (explanation of your selection) and sample SQLs queries.
  
  If there's a data source or endpoint that answers the question, report it and exit.
  
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
