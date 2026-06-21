import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "https://atendaz.vercel.app",
    supportFile: false,
  },
});
