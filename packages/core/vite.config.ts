import { sveltekit } from "@sveltejs/kit/vite";
import { svelteTesting } from "@testing-library/svelte/vite";
import { defaultExclude, defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [sveltekit(), svelteTesting()],
	test: {
		environment: "jsdom",
		setupFiles: ["./tests/vitest.setup.ts"],
		exclude: [...defaultExclude, ".svelte-kit/**/*"],
		coverage: {
			all: true,
			include: ["src/lib/**/*"],
			exclude: ["**/__test__/**/*", "**/types.ts", "**/src/lib/index.ts"],
		},
	},
});
