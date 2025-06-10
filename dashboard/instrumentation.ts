import { diag, DiagConsoleLogger, DiagLogLevel } from "@opentelemetry/api";
import {
  LoggerProvider,
  BatchLogRecordProcessor,
} from "@opentelemetry/sdk-logs";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { registerOTel } from "@vercel/otel";

const OTEL_LOGS_URL = process.env.OTEL_EXPORTER_OTLP_ENDPOINT + "/v1/logs";

export function register() {
  let processor: BatchLogRecordProcessor | undefined;

  try {
    const exporter = new OTLPLogExporter({ url: OTEL_LOGS_URL });
    const processor = new BatchLogRecordProcessor(exporter);
    const loggerProvider = new LoggerProvider();
    
    loggerProvider.addLogRecordProcessor(processor);
    diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.ERROR);
  } catch (error) { 
    console.error("Error registering OpenTelemetry logs provider", error);
  }

  registerOTel({
    serviceName: process.env.OTEL_SERVICE_NAME || "next-app",
    logRecordProcessor: processor || undefined,
  });
}
