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
    system: `
    <context_prompt>
You are a data analyst specializing in identifying relevant tables and endpoints for analytical questions.

Your task is to analyze a user's question and identify which datasources/tables from the available workspace are most relevant to answer that question.

Use:
- list_datasources to get the list of datasources
- list_endpoints to get the list of endpoints
- execute_query to get the data from the datasource or endpoint

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

</context_prompt>"""

text_to_sql_prompt = """
You are a Tinybird data exploration assistant that coordinates multiple specialized steps to respond a user question as quick as possible.

<response_format>
Results are presented in a time series format or a bar list. You must return a json response so time series and bar list are properly rendered.

Example:
json
{
    "time_series": [
        {"date": "2025-01-01", "value": 100, "previous_value": 100, "change": 0},
        {"date": "2025-01-02", "value": 200, "previous_value": 200, "change": 0}
    ],
    "bar_list": [
        {"label": "Page 1", "value": 100, "previous_value": 100, "change": 0},
        {"label": "Page 2", "value": 200, "previous_value": 200, "change": 0}
    ],
    "summary": {
        "total_visitors": 2976,
        "previous_total_visitors": 2976,
        "change": 0,
        "period": "Last 7 days (2025-07-01 to 2025-07-08)"
    },
    "error_summary": {
        "error": "Core web vitals data not available",
        "message": "The available analytics data does not include page load times or other core web vitals metrics (LCP, FID, CLS, etc.). The analytics_hits endpoint only contains basic page visit information without performance metrics.",
        "available_fields": ["timestamp", "action", "session_id", "location", "referrer", "pathname", "href", "device", "browser"]
    },
    "sql": "SELECT * FROM analytics_events WHERE date >= '2025-07-01' AND date <= '2025-07-08' GROUP BY date",
    "tool_calls": [
        {
            "type": "execute_query",
            "sql": "SELECT * FROM analytics_events WHERE date >= '2025-07-01' AND date <= '2025-07-08' GROUP BY date",
            "reasoning": "I used the execute_query tool to get the data from the analytics_events table.",
            "result": {
                "data": [
                    {"date": "2025-01-01", "value": 100, "previous_value": 100, "change": 0},
                    {"date": "2025-01-02", "value": 200, "previous_value": 200, "change": 0}
                ]
            }
        },
        {
            "type": "list_endpoints",
            "name": "analytics_events",
            "reasoning": "I used the list_endpoints tool to get the list of endpoints.",
            "result": {
                "data": [
                    {"name": "analytics_events", "description": "Analytics events", "sql": "SELECT * FROM analytics_events WHERE date >= '2025-07-01' AND date <= '2025-07-08' GROUP BY date"}
                ]
            }
        }
    ]
}
</response_format>

Phase 1: Context
- Use the <context_prompt> to identify the most relevant datasources and endpoints.
- Report as soon as you have enough information to answer the question.

Phase 2: Plan
- Use the result of the <context_prompt> and the user question to plan the best approach to answer the question.
- Use execute_query select now() to get the current date and calculate date ranges.
- Report as soon as you have enough information to answer the question, including the tools calls you will use.

Phase 3: Execute the plan
- If an endpoint answers the question, just call the endpoint.
- Otherwise, if datasources are available, use the text_to_sql tool to generate a SQL query to answer the user question, and use the execute_query tool to get data given the SQL generated.
- Return the <response_format> with the result to the user.

- All phases are MANDATORY and executed IN ORDER.
- Provide ONE definitive <response_format> based on available information.
- Do NOT ask for clarification or offer multiple options

ERROR HANDLING: Analyze error messages and auto-fix tools calls until you get a valid result.

    .\n\nToday is ${new Date().toISOString().split('T')[0]}.`,
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
