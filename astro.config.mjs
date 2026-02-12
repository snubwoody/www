// @ts-check
/* global process */
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";
import svelte from "@astrojs/svelte";
import node from "@astrojs/node";
import vercel from "@astrojs/vercel";
import remarkReadingTime from "./reading-time.mjs";

export default defineConfig({
    site: "https://wakunguma.com",
    output: "static",
    prefetch: true,
    markdown: {
        shikiConfig: {
            themes: {
                light: "everforest-light",
                dark: "everforest-dark"
            }
        },
        remarkPlugins: [remarkReadingTime]
    },
    integrations: [
        svelte(),
        sitemap()
    ],
    vite: {
        plugins: [
            tailwindcss()
        ]
    },

    adapter: !(process.env.VERCEL_ENV === "production" || process.env.VERCEL_ENV === "preview") ? node({
        mode: "standalone"
    }) : vercel()
});
