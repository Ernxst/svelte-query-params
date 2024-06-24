import { defineConfig } from "tsup";

export default defineConfig({
	format: ["esm", "cjs"],
	dts: true,
	sourcemap: true,
	bundle: true,
	clean: true,
	external: ["$app/stores", "$app/navigation"],
	entryPoints: {
		"index.svelte": "src/lib/index.ts",
		"adapters/index": "src/lib/adapters/index.ts",
		"adapters/browser/index": "src/lib/adapters/browser.ts",
		"adapters/sveltekit/index": "src/lib/adapters/sveltekit.ts",
	},
});
