import { test, expect } from "@playwright/test";

test("Default title", async({page}) => {
    await page.goto("/");
    await expect(page).toHaveTitle("Wakunguma Kalimukwa");
});

test("Writing section", async({page}) => {
    await page.goto("/");
    const heading = page.locator("section").getByRole("heading",{name:"Writing"});
    await expect(heading).toBeVisible();
});

test("Software section", async({page}) => {
    await page.goto("/");
    const heading = page.locator("section").getByRole("heading",{name:"Software"});
    await expect(heading).toBeVisible();
});

test("Articles shown on home page", async({page,baseURL}) => {
    await page.goto("/");
    const links = await page.getByRole("list",{name: "Article list"}).getByRole("link").all();
    expect(links.length).toBe(5);

    const url = await links[0].getAttribute("href");
    await links[0].click();
    expect(page.url()).toBe(`${baseURL}${url}`);
});
