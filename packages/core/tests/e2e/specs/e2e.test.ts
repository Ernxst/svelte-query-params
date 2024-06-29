import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

function location(page: Page) {
	const url = new URL(page.url());
	return url;
}

test.describe
	.parallel("with strings", () => {
		test("should prepopulate from url", async ({ page }) => {
			await page.goto("/tabs?tab=users");

			const title = page.getByRole("heading", { level: 1 });
			const [home, users] = await page.getByRole("tab").all();

			expect(title).toHaveText("Users Page");
			expect(home).not.toBeDisabled();
			expect(home).toHaveAttribute("aria-selected", "false");
			expect(users).toBeDisabled();
			expect(users).toHaveAttribute("aria-selected", "true");
		});

		test("should prepopulate from url with a hash", async ({ page }) => {
			await page.goto("/tabs?tab=users#hash");

			const title = page.getByRole("heading", { level: 1 });
			const [home, users] = await page.getByRole("tab").all();
			const url = location(page);

			expect(title).toHaveText("Users Page");
			expect(home).not.toBeDisabled();
			expect(home).toHaveAttribute("aria-selected", "false");
			expect(users).toBeDisabled();
			expect(users).toHaveAttribute("aria-selected", "true");
			expect(url.hash).toEqual("#hash");
		});

		test("should update query params", async ({ page }) => {
			await page.goto("/tabs");
			const title = page.getByRole("heading", { level: 1 });
			const [home, users] = await page.getByRole("tab").all();

			expect(title).toHaveText("Home Page");
			expect(home).toBeDisabled();
			expect(home).toHaveAttribute("aria-selected", "true");
			expect(users).not.toBeDisabled();
			expect(users).toHaveAttribute("aria-selected", "false");

			await users.click();
			const url = location(page);

			expect(url.search).toEqual("?tab=users");
			expect(title).toHaveText("Users Page");
			expect(home).not.toBeDisabled();
			expect(home).toHaveAttribute("aria-selected", "false");
			expect(users).toBeDisabled();
			expect(users).toHaveAttribute("aria-selected", "true");
		});

		test("should maintain hash", async ({ page }) => {
			await page.goto("/tabs#some-hash");
			const [home, users] = await page.getByRole("tab").all();
			const url = location(page);

			expect(url.hash).toEqual("#some-hash");

			await users.click();

			expect(page).toHaveURL("/tabs?tab=users#some-hash");
		});
	});

test.describe
	.parallel("with numbers", () => {
		test("should prepopulate from url", async ({ page }) => {
			await page.goto("/pagination?page=4");

			const title = page.getByRole("heading", { level: 1 });
			const subtitle = page.getByRole("heading", { level: 2 });
			const [prev, next] = await page.getByRole("button").all();

			expect(title).toHaveText("Current Page: 4");
			expect(subtitle).toHaveText("Page Size: 10");
			expect(prev).not.toBeDisabled();
			expect(next).not.toBeDisabled();
		});

		test("should prepopulate from url with a hash", async ({ page }) => {
			await page.goto("/pagination?page=4#hash");

			const title = page.getByRole("heading", { level: 1 });
			const subtitle = page.getByRole("heading", { level: 2 });
			const [prev, next] = await page.getByRole("button").all();
			const url = location(page);

			expect(url.hash).toEqual("#hash");
			expect(title).toHaveText("Current Page: 4");
			expect(subtitle).toHaveText("Page Size: 10");
			expect(prev).not.toBeDisabled();
			expect(next).not.toBeDisabled();
		});

		test("should update query params", async ({ page }) => {
			await page.goto("/pagination");
			const title = page.getByRole("heading", { level: 1 });
			const [prev, next] = await page.getByRole("button").all();

			expect(title).toHaveText("Current Page: 1");
			expect(prev).toBeDisabled();
			expect(next).not.toBeDisabled();

			await next.click();
			const url = location(page);

			expect(url.search).toEqual("?page=2");
			expect(title).toHaveText("Current Page: 2");
			expect(next).not.toBeDisabled();
			expect(prev).not.toBeDisabled();
		});

		test("should maintain hash", async ({ page }) => {
			await page.goto("/pagination#some-hash");
			const [_prev, next] = await page.getByRole("button").all();
			const url = location(page);

			expect(url.hash).toEqual("#some-hash");

			await next.click();

			expect(page).toHaveURL("/pagination?page=2#some-hash");
		});
	});

test.describe
	.parallel("debounce", () => {
		test("should debounce url updates", async ({ page }) => {
			await page.goto("/search");
			const input = page.getByRole("searchbox");
			await input.focus();

			page.keyboard.type("searchterm");
			let url = location(page);
			expect(url.search).toEqual("");

			await page.waitForTimeout(250);
			url = location(page);
			expect(url.search).toEqual("");

			await page.waitForTimeout(1000);
			url = location(page);

			expect(url.search).toEqual("?q=searchterm");
		});
	});

test.describe
	.parallel("ssr", () => {
		test("should set params on server", async ({ page }) => {
			await page.goto("/ssr");
			const title = page.getByRole("heading", { level: 1 });
			const subtitle = page.getByRole("heading", { level: 2 });
			const url = location(page);

			expect(url.search).toEqual("?count=10");
			expect(title).toHaveText("Count: 10");
			expect(subtitle).toHaveText("Count: 10");
		});

		test("should maintain hash", async ({ page }) => {
			await page.goto("/ssr#some-hash");
			const title = page.getByRole("heading", { level: 1 });
			const subtitle = page.getByRole("heading", { level: 2 });
			const url = location(page);

			expect(url.hash).toEqual("#some-hash");
			expect(url.search).toEqual("?count=10");
			expect(title).toHaveText("Count: 10");
			expect(subtitle).toHaveText("Count: 10");
		});
	});
