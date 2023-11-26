import { sveltekit } from "@sveltejs/kit/vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [
		process.env.VITEST
			? (svelte({
					compilerOptions: {
						legacy: { componentApi: true },
					},
					// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			  }) as any)
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
