import { defineToken } from "@tinybirdco/sdk";

// Define the dashboard token for read access to all endpoints
const dashboardToken = defineToken("dashboard");

// Define the tracker token for write access to the analytics_events datasource
const trackerToken = defineToken("tracker");

export { dashboardToken, trackerToken };
