import rss from "@astrojs/rss";
import { getPosts } from "../lib";

export const prerender = true;

// TODO:
// - Actually check the image size and type
// - Test this
export async function GET(){
    const posts = await getPosts();

    return rss({
        title: "Waku's blog",
        description: "My personal blog",
        site: "https://wakunguma.com",
        items: posts.map(post => {
            return ({
                title: post.data.title,
                description: post.data.synopsis,
                pubDate: new Date(post.data.published),
                link: `https://wakunguma.com/blog/${post.id}`,
                enclosure:{
                    url: `https://wakunguma.com${post.data.image}`,
                    length: post.data.imageSize,
                    type: "image/png"
                }
            });
        })
    });
}
