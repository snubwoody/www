/// <reference types="vitest" />
import { getViteConfig } from "astro/config";

export default getViteConfig({
    test: {
        environment: "node",
        exclude: ["e2e","node_modules",".vercel","dist"],
        include: ["**/*.test.ts"]
    }
});
