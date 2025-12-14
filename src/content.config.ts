import {defineCollection,z} from "astro:content";
import {glob} from "astro/loaders";

// TODO: get the image based on the id
const articles = defineCollection({
    loader: glob({pattern:"**/*.md",base:"./src/articles"}),
    schema: ({image}) => z.object({
        title: z.string(),
        author: z.string(),
        layout: z.string(),
        published: z.date(),
        image: z.string(),
        imageAsset: image(),
        // TODO: deprecate this
        imageSize: z.number(),
        synopsis: z.string(),
        preview: z.boolean(),
        tags: z.array(z.string())
    })
});

export const collections = {articles};
