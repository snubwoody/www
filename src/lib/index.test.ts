import { test, describe, expect } from "vitest";
import { sortPosts, getPosts } from "./index.ts";

describe("Sort posts", () => {
    test("by title", async () => {
        const posts = sortPosts(await getPosts(), "title");
        for (const [index, post] of posts.entries()) {
            if (index === posts.length - 1) continue;
            expect(post.data.title < posts[index + 1].data.title).toBe(true);
        }
    });

    test("by creation date", async () => {
        const posts = sortPosts(await getPosts(), "date_created");
        for (const [index, post] of posts.entries()) {
            if (index === posts.length - 1) continue;
            expect(post.data.published.getTime()).toBeGreaterThan(
                posts[index + 1].data.published.getTime(),
            );
        }
    });
});

test("Preview posts are filtered out", async () => {
    const posts = await getPosts();
    posts.forEach((post) => {
        if (post.data.preview) {
            throw "Preview posts are not supposed to be included";
        }
    });
});

test("Posts have correct author", async () => {
    const posts = await getPosts();
    posts.forEach((post) => {
        if (post.data.author !== "Wakunguma Kalimukwa") {
            throw "Post does not have required frontmatter properties";
        }
    });
});
