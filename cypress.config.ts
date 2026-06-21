import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: process.env.CYPRESS_BASE_URL || "https://atendaz.vercel.app",
    supportFile: false,
    screenshotOnRunFailure: false,
    video: false,
  },
});
