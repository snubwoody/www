import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const articles = defineCollection({
    loader: glob({ pattern: "**/*.md", base: "./src/articles" }),
    schema: ({ image }) =>
        z.object({
            title: z.string(),
            author: z.string(),
            published: z.date(),
            image: z.string(),
            imageAsset: image(),
            synopsis: z.string(),
            preview: z.boolean(),
            tags: z.array(z.string()),
        }),
});

export const collections = { articles };
