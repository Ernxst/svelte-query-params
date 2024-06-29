import { resolve } from "node:path";
import { defineConfig, devices } from "@playwright/test";

function playwrightDir(partialPath: string) {
	return resolve("./tests/e2e", partialPath);
}

const CI = !!process.env.CI;

export default defineConfig({
	testDir: playwrightDir("specs"),
	outputDir: playwrightDir("results"),
	webServer: {
		command: "bun vite build && bun vite preview",
		port: 4173,
	},
	use: {
		screenshot: "only-on-failure",
		trace: "retain-on-failure",
	},
	testMatch: /(.+\.)?(test|spec)\.[jt]s/,
	reporter: CI
		? [["github"]]
		: [
				[
					"html",
					{ outputFolder: playwrightDir("./report"), open: "on-failure" },
				],
			],
	projects: [
		{
			name: "chromium",
			use: {
				...devices["Desktop Chrome"],
			},
		},
		{
			name: "firefox",
			use: {
				...devices["Desktop Firefox"],
			},
		},
		{
			name: "webkit",
			use: {
				...devices["Desktop Safari"],
			},
		},
		{
			name: "Mobile Chrome",
			use: { ...devices["Pixel 5"] },
		},
		{
			name: "Mobile Safari",
			use: { ...devices["iPhone 14"] },
		},
		/** Test branded browsers */
		{
			name: "google",
			use: {
				...devices["Desktop Google Chrome"],
			},
		},
		{
			name: "msedge",
			use: {
				...devices["Desktop Edge"],
			},
		},
	],
});
