import type { APIRoute } from "astro";
import { type Theme } from "../../lib/theme";
import { createSubscriber } from "../../lib/subscriber";

export type SubscribeRequest = {
    email: Theme
};

export const POST: APIRoute = async({ request }) => {
    try{
        const body = await request.json() as SubscribeRequest;
        await createSubscriber(body.email);
        return new Response(null,{status: 201});
    } catch(e){
        return new Response(JSON.stringify(e),{status: 500});
    }

};

export const prerender = false;
