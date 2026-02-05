import { defineToken } from "@tinybirdco/sdk";

// Define the dashboard token for read access to all endpoints
const dashboardToken = defineToken("dashboard");

export { dashboardToken };
