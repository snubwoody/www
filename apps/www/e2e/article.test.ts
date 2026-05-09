import { test, expect } from "@playwright/test";

test("Page title", async({page}) => {
    await page.goto("/blog");
    await expect(page).toHaveTitle("Browse articles");
});

test("Sort button default", async({page}) => {
    await page.goto("/blog");
    await expect(page.getByRole("button",{name: "Sort by: Date created"})).toBeVisible();
});

test("Click sort button", async({page}) => {
    await page.goto("/blog");
    await page.getByRole("button",{name: "Sort by: Date created"}).click();
    await page.getByRole("link",{name:"Title"}).click();
    await expect(page).toHaveURL("/blog?sort_by=title");
    await expect(page.getByRole("button",{name: "Sort by: Title"})).toBeVisible();
});

test("Sort by title", async({page}) => {
    await page.goto("/blog?sort_by=title");
    const headings = await page.getByRole("heading",{level: 4}).allTextContents();
    expect(headings).toEqual(headings.toSorted());
});

test("Latest post link works",async({page, baseURL,isMobile}) => {
    // Skip on mobile because this section is hidden
    if (isMobile) {
        return;
    }

    await page.goto("/blog");
    const elements = await page
        .getByRole("list",{name: "Latest posts list"})
        .getByRole("link")
        .all();
    expect(elements.length).toBe(5);

    const url = await elements[0].getAttribute("href");
    await elements[0].click();
    expect(page.url()).toBe(`${baseURL}${url}`);
});


