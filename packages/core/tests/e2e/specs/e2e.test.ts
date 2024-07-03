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

			await expect(title).toHaveText("Users Page");
			await expect(home).not.toBeDisabled();
			await expect(home).toHaveAttribute("aria-selected", "false");
			await expect(users).toBeDisabled();
			await expect(users).toHaveAttribute("aria-selected", "true");
		});

		test("should prepopulate from url with a hash", async ({ page }) => {
			await page.goto("/tabs?tab=users#hash");

			const title = page.getByRole("heading", { level: 1 });
			const [home, users] = await page.getByRole("tab").all();

			await expect(title).toHaveText("Users Page");
			await expect(home).not.toBeDisabled();
			await expect(home).toHaveAttribute("aria-selected", "false");
			await expect(users).toBeDisabled();
			await expect(users).toHaveAttribute("aria-selected", "true");

			const url = location(page);
			expect(url.hash).toEqual("#hash");
		});

		test("should update query params", async ({ page }) => {
			await page.goto("/tabs");
			const title = page.getByRole("heading", { level: 1 });
			const [home, users] = await page.getByRole("tab").all();

			await expect(title).toHaveText("Home Page");
			await expect(home).toBeDisabled();
			await expect(home).toHaveAttribute("aria-selected", "true");
			await expect(users).not.toBeDisabled();
			await expect(users).toHaveAttribute("aria-selected", "false");

			await users.click();

			await expect(title).toHaveText("Users Page");
			await expect(home).not.toBeDisabled();
			await expect(home).toHaveAttribute("aria-selected", "false");
			await expect(users).toBeDisabled();
			await expect(users).toHaveAttribute("aria-selected", "true");

			const url = location(page);
			expect(url.search).toEqual("?tab=users");
		});

		test("should maintain hash", async ({ page }) => {
			await page.goto("/tabs#some-hash");
			const [_home, users] = await page.getByRole("tab").all();
			const url = location(page);

			expect(url.hash).toEqual("#some-hash");

			await users.click();
			await expect(page).toHaveURL("/tabs?tab=users#some-hash");
		});
	});

test.describe
	.parallel("with numbers", () => {
		test("should prepopulate from url", async ({ page }) => {
			await page.goto("/pagination?page=4");

			const title = page.getByRole("heading", { level: 1 });
			const subtitle = page.getByRole("heading", { level: 2 });
			const [prev, next] = await page.getByRole("button").all();

			await expect(title).toHaveText("Current Page: 4");
			await expect(subtitle).toHaveText("Page Size: 10");
			await expect(prev).not.toBeDisabled();
			await expect(next).not.toBeDisabled();
		});

		test("should prepopulate from url with a hash", async ({ page }) => {
			await page.goto("/pagination?page=4#hash");

			const title = page.getByRole("heading", { level: 1 });
			const subtitle = page.getByRole("heading", { level: 2 });
			const [prev, next] = await page.getByRole("button").all();

			await expect(title).toHaveText("Current Page: 4");
			await expect(subtitle).toHaveText("Page Size: 10");
			await expect(prev).not.toBeDisabled();
			await expect(next).not.toBeDisabled();

			const url = location(page);
			expect(url.hash).toEqual("#hash");
		});

		test("should update query params", async ({ page }) => {
			await page.goto("/pagination");
			const title = page.getByRole("heading", { level: 1 });
			const [prev, next] = await page.getByRole("button").all();

			expect(title).toHaveText("Current Page: 1");
			expect(prev).toBeDisabled();
			expect(next).not.toBeDisabled();

			await next.click();

			await expect(title).toHaveText("Current Page: 2");
			await expect(next).not.toBeDisabled();
			await expect(prev).not.toBeDisabled();

			const url = location(page);
			expect(url.search).toEqual("?page=2");
		});

		test("should maintain hash", async ({ page }) => {
			await page.goto("/pagination#some-hash");
			const [_prev, next] = await page.getByRole("button").all();
			const url = location(page);

			expect(url.hash).toEqual("#some-hash");

			await next.click();

			await expect(page).toHaveURL("/pagination?page=2#some-hash");
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
			await expect(title).toHaveText("Count: 10");
			await expect(subtitle).toHaveText("Count: 10");
		});

		test("should maintain hash", async ({ page }) => {
			await page.goto("/ssr#some-hash");
			const title = page.getByRole("heading", { level: 1 });
			const subtitle = page.getByRole("heading", { level: 2 });
			const url = location(page);

			expect(url.hash).toEqual("#some-hash");
			expect(url.search).toEqual("?count=10");
			await expect(title).toHaveText("Count: 10");
			await expect(subtitle).toHaveText("Count: 10");
		});
	});

test.describe("array values", () => {
	test("should prepopulate from url", async ({ page }) => {
		await page.goto("/multiselect?categories=electronics&categories=books");

		const [optionsList, resultsList] = await page.getByRole("list").all();
		const options = await optionsList.getByRole("checkbox").all();
		const selectedCategories = await resultsList.getByRole("listitem").all();

		expect(options[0]).toBeChecked();
		expect(options[1]).toBeChecked();
		expect(options[2]).not.toBeChecked();

		expect(selectedCategories).toHaveLength(2);
		expect(selectedCategories[0]).toHaveText("electronics");
		expect(selectedCategories[1]).toHaveText("books");
	});

	test("should prepopulate from url with a hash", async ({ page }) => {
		await page.goto(
			"/multiselect?categories=electronics&categories=books#hash"
		);

		const [_otionsList, resultsList] = await page.getByRole("list").all();
		const selectedCategories = await resultsList.getByRole("listitem").all();

		expect(selectedCategories).toHaveLength(2);
		await expect(selectedCategories[0]).toHaveText("electronics");
		await expect(selectedCategories[1]).toHaveText("books");

		const url = location(page);
		expect(url.hash).toEqual("#hash");
	});

	test("should add to array param", async ({ page }) => {
		await page.goto("/multiselect");

		const [optionsList, resultsList] = await page.getByRole("list").all();
		const options = await optionsList.getByRole("checkbox").all();
		let selectedCategories = await resultsList.getByRole("listitem").all();

		expect(selectedCategories).toHaveLength(0);
		await expect(options[0]).not.toBeChecked();
		await expect(options[1]).not.toBeChecked();
		await expect(options[2]).not.toBeChecked();

		await options[0].click();
		await options[2].click();

		selectedCategories = await resultsList.getByRole("listitem").all();

		expect(selectedCategories).toHaveLength(2);
		await expect(selectedCategories[0]).toHaveText("books");
		await expect(selectedCategories[1]).toHaveText("toys");

		const url = location(page);
		expect(url.search).toEqual("?categories=books&categories=toys");
	});

	test("should remove from array param", async ({ page }) => {
		await page.goto("/multiselect?categories=electronics&categories=books");

		const [optionsList, resultsList] = await page.getByRole("list").all();
		const options = await optionsList.getByRole("checkbox").all();
		let selectedCategories = await resultsList.getByRole("listitem").all();

		expect(selectedCategories).toHaveLength(2);
		await expect(options[0]).toBeChecked();
		await expect(options[1]).toBeChecked();
		await expect(options[2]).not.toBeChecked();
		await expect(selectedCategories[0]).toHaveText("electronics");
		await expect(selectedCategories[1]).toHaveText("books");

		await options[0].click();

		await expect(options[0]).not.toBeChecked();
		await expect(options[1]).toBeChecked();
		await expect(options[2]).not.toBeChecked();

		selectedCategories = await resultsList.getByRole("listitem").all();

		expect(selectedCategories).toHaveLength(1);
		await expect(selectedCategories[0]).toHaveText("electronics");

		let url = location(page);
		expect(url.search).toEqual("?categories=electronics");

		await options[1].click();

		await expect(options[0]).not.toBeChecked();
		await expect(options[1]).not.toBeChecked();
		await expect(options[2]).not.toBeChecked();

		url = location(page);
		selectedCategories = await resultsList.getByRole("listitem").all();
		expect(selectedCategories).toHaveLength(0);
		expect(url.search).toEqual("");

		await options[0].click();

		await expect(options[0]).toBeChecked();
		await expect(options[1]).not.toBeChecked();
		await expect(options[2]).not.toBeChecked();

		selectedCategories = await resultsList.getByRole("listitem").all();

		expect(selectedCategories).toHaveLength(1);
		await expect(selectedCategories[0]).toHaveText("books");

		url = location(page);
		expect(url.search).toEqual("?categories=books");

		await options[1].click();

		await expect(options[0]).toBeChecked();
		await expect(options[1]).toBeChecked();
		await expect(options[2]).not.toBeChecked();

		selectedCategories = await resultsList.getByRole("listitem").all();

		expect(selectedCategories).toHaveLength(2);
		await expect(selectedCategories[0]).toHaveText("books");
		await expect(selectedCategories[1]).toHaveText("electronics");

		url = location(page);
		expect(url.search).toEqual("?categories=books&categories=electronics");

		await options[2].click();

		await expect(options[0]).toBeChecked();
		await expect(options[1]).toBeChecked();
		await expect(options[2]).toBeChecked();

		selectedCategories = await resultsList.getByRole("listitem").all();

		expect(selectedCategories).toHaveLength(3);
		await expect(selectedCategories[0]).toHaveText("books");
		await expect(selectedCategories[1]).toHaveText("electronics");
		await expect(selectedCategories[2]).toHaveText("toys");

		url = location(page);
		expect(url.search).toEqual(
			"?categories=books&categories=electronics&categories=toys"
		);
	});
});
