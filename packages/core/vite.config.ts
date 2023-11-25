import { sveltekit } from "@sveltejs/kit/vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [
		process.env.VITEST ? svelte({
			compilerOptions: {
				legacy: { componentApi: true },
			},
		})
			: sveltekit(),
	],
	test: {
		globals: true,
		environment: "jsdom",
		setupFiles: ["test/setup.ts"],
	},
});
