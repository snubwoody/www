import { type CollectionEntry, getCollection } from "astro:content";

export type SortOption = "title" | "date_created";

export interface GetPostsParams {
    /**
     * Sort the list in descending order
     */
    sort?: boolean;
}

/**
 * Returns all the articles in the articles collection with the `preview`
 * field set to false.
 */
export const getPosts = async (
    params?: GetPostsParams,
): Promise<CollectionEntry<"articles">[]> => {
    const sort = params?.sort ?? false;
    let articles = await getCollection("articles", (post) => {
        return !post.data.preview;
    });

    if (sort) {
        articles = articles
            .sort(
                (a, b) =>
                    a.data.published.getTime() - b.data.published.getTime(),
            )
            .reverse();
    }

    return articles;
};

export const sortPosts = (
    posts: CollectionEntry<"articles">[],
    opt: SortOption = "title",
): CollectionEntry<"articles">[] => {
    let sorted = posts;
    switch (opt) {
        case "title":
            sorted = posts.toSorted((a, b) =>
                a.data.title.localeCompare(b.data.title),
            );
            break;
        case "date_created":
            sorted = posts
                .toSorted(
                    (a, b) =>
                        a.data.published.getTime() - b.data.published.getTime(),
                )
                .reverse();
            break;
    }
    return sorted;
};
