import { sveltekit } from "@sveltejs/kit/vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [
		// @ts-expect-error ???
		process.env.VITEST
			? svelte({
					compilerOptions: {
						legacy: { componentApi: true },
					},
			  })
			: sveltekit(),
	],
	test: {
		watch: false,
		globals: true,
		environment: "jsdom",
		setupFiles: ["test/setup.ts"],
		typecheck: {
			ignoreSourceErrors: true,
		},
	},
});
