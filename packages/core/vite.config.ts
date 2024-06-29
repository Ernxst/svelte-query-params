import { sveltekit } from "@sveltejs/kit/vite";
import { svelteTesting } from "@testing-library/svelte/vite";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [sveltekit(), svelteTesting()],
	test: {
		environment: "jsdom",
		setupFiles: ["./tests/vitest.setup.ts"],
		include: ["src/**/*.{test,spec}.{js,ts}"],
		typecheck: {
			ignoreSourceErrors: true,
		},
	},
});
