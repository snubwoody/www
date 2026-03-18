import { test, expect } from "@playwright/test";


test("Default data-theme attribute", async({page}) => {
    await page.goto("http://localhost:4321");
    await expect(page.locator("html")).toHaveAttribute("data-theme","light");
});

test("Toggle dark mode", async ({ page }) => {
    await page.goto("http://localhost:4321");
    await page.getByLabel("Toggle theme").click();
    const theme = await page.evaluate(() => {
        return JSON.parse(localStorage.getItem("theme")!);
    });
    const attr = await page.getAttribute("html","data-theme");
    expect(theme).toBe("dark");
    expect(attr).toBe("dark");
});

test("Toggle light mode", async ({ page }) => {
    await page.goto("http://localhost:4321");
    await page.getByLabel("Toggle theme").click();
    await page.getByLabel("Toggle theme").click();
    const theme = await page.evaluate(() => {
        return JSON.parse(localStorage.getItem("theme")!);
    });
    const attr = await page.getAttribute("html","data-theme");
    expect(theme).toBe("light");
    expect(attr).toBe("light");
});

