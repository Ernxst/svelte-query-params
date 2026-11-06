import { defineConfig } from "tsdown";

export default defineConfig({
	format: ["esm", "cjs"],
	dts: true,
	sourcemap: false,
	clean: true,
	fixedExtension: false,
	deps: {
		neverBundle: [
			"$app/navigation",
			"$app/state",
			"$app/env",
			"svelte",
			"@sveltejs/kit",
		],
	},
	entry: {
		"index.svelte": "src/lib/index.ts",
		"adapters/index": "src/lib/adapters/index.ts",
		"adapters/browser/index": "src/lib/adapters/browser.ts",
		"adapters/sveltekit/index": "src/lib/adapters/sveltekit.ts",
	},
});
