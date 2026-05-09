import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const articles = defineCollection({
    loader: glob({pattern:"**/*.md",base:"./src/articles"}),
    schema: () => z.object({
        title: z.string(),
        published: z.date(),
        preview: z.boolean(),
    })
});

export const collections = { articles };
