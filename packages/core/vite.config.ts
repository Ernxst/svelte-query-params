import adapter from "@sveltejs/adapter-auto";
import { sveltekit } from "@sveltejs/kit/vite";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { svelteTesting } from "@testing-library/svelte/vite";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [
		sveltekit({
			preprocess: vitePreprocess(),
			adapter: adapter(),
		}),
		svelteTesting(),
	],
	test: {
		environment: "jsdom",
		setupFiles: ["./tests/vitest.setup.ts"],
		include: ["src/**/*.{test,spec}.{js,ts}"],
		typecheck: {
			ignoreSourceErrors: true,
		},
	},
});
