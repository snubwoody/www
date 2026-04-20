import js from "@eslint/js";
import stylistic from "@stylistic/eslint-plugin";
import globals from "globals";
import svelte from "eslint-plugin-svelte";
import ts from "typescript-eslint";
import eslintPluginAstro from "eslint-plugin-astro";
import { defineConfig, globalIgnores } from "eslint/config";
import svelteConfig from "./svelte.config.mjs";

export default defineConfig([
    globalIgnores([".astro", ".obsidian", "dist", "node_modules", ".vercel"]),
    ts.configs.recommended,
    eslintPluginAstro.configs.recommended,
    svelte.configs.recommended,
    {
        files: ["**/*.svelte"],
        languageOptions: {
            parserOptions: {
                projectService: true,
                extraFileExtensions: [".svelte"],
                parser: ts.parser,
                svelteConfig,
            },
        },
    },
    {
        files: ["**/*.{js,mjs,cjs,ts,astro,svelte}"],
        languageOptions: { globals: globals.browser },
        plugins: {
            js,
            "@stylistic": stylistic,
        },
        extends: ["js/recommended"],
        rules: {
            "@typescript-eslint/no-unused-vars": "warn",
            "@typescript-eslint/no-empty-object-type": "warn", // Duplicate
            "no-unused-vars": "off", // Duplicate
            "prefer-const": "warn",
            "no-empty": "warn",
            "@stylistic/indent": ["warn", 4],
            "@stylistic/quotes": ["warn", "double"],
            "@stylistic/semi": ["error"],
            "@stylistic/arrow-spacing": ["warn"],
            "@stylistic/brace-style": ["error"],
            "@stylistic/comma-dangle": ["error", "never"],
        },
    },
    {
        files: ["playwright.config.*"],
        languageOptions: {
            globals: globals.node,
        },
    },
]);
