// @ts-check
/* global process */

import { unified } from "@astrojs/markdown-remark";
import node from "@astrojs/node";
import sitemap from "@astrojs/sitemap";
import svelte from "@astrojs/svelte";
import vercel from "@astrojs/vercel";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import wordCount from "./src/plugins/word-count.js";

export default defineConfig({
    site: "https://wakunguma.com",
    output: "static",
    prefetch: true,
    markdown: {
        processor: unified({
            remarkPlugins: [wordCount],
        }),
        shikiConfig: {
            themes: {
                light: "everforest-light",
                dark: "everforest-dark",
            },
        },
    },
    integrations: [svelte(), sitemap()],
    vite: {
        plugins: [tailwindcss()],
    },
    adapter: !(
        process.env.VERCEL_ENV === "production" ||
        process.env.VERCEL_ENV === "preview"
    )
        ? node({
              mode: "standalone",
          })
        : vercel(),
});
