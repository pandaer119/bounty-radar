import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:3137",
    channel: "chrome",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "desktop-chrome",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 1000 } },
    },
  ],
  webServer: {
    command: "npm run dev -- --hostname 127.0.0.1 --port 3137",
    url: "http://127.0.0.1:3137/api/health",
    env: {
      KEEPERHUB_API_KEY: "",
      KEEPERHUB_SIMULATION_ENABLED: "false",
      OPPORTUNITY_REGISTRY_ADDRESS: "",
    },
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
