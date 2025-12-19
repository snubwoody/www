import rss from "@astrojs/rss";
import { getPosts } from "../lib";
import fs from "node:fs/promises";

export const prerender = true;

export async function GET(){
    const items = [];
    for await (const item of rssItems()){
        items.push(item);
        console.log(item);
    }

    return rss({
        title: "Waku's blog",
        description: "My personal blog",
        site: "https://wakunguma.com",
        items
    });
}

async function* rssItems(){
    const posts = await getPosts();

    for (const post of posts){
        const image = await fs.readFile(`./public${post.data.image}`,{encoding:"binary"});
        yield {
            title: post.data.title,
            description: post.data.synopsis,
            pubDate: new Date(post.data.published),
            link: `https://wakunguma.com/blog/${post.id}`,
            enclosure:{
                url: `https://wakunguma.com${post.data.image}`,
                length: image.length,
                type: "image/png"
            }
        };
    }
};
