import type { AstroCookies } from "astro";

export type Theme = "light" | "dark";

export const setThemeCookie = (cookies: AstroCookies,value: Theme) => {
    cookies.set("theme",value,{
        path: "/",
        secure:true,
        sameSite: "strict",
        maxAge: 3600 * 24 * 365 * 100 // Set a really long expiry (100 years)
    });
};
