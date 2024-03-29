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
			  }) as any)
			: sveltekit(),
	],
	test: {
		watch: false,
		globals: true,
		environment: "jsdom",
		setupFiles: ["test/setup.ts"],
		coverage: {
			all: true,
			include: ["src/lib/**/*"],
			exclude: ["**/__test__/**/*", "**/types.ts", "**/src/lib/index.ts"],
			reporter: ["text-summary", "html"],
		},
		typecheck: {
			ignoreSourceErrors: true,
		},
	},
});
