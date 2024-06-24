import { defineConfig } from "tsup";

export default defineConfig({
	format: ["esm", "cjs"],
	dts: true,
	sourcemap: false,
	bundle: true,
	clean: true,
	splitting: false,
	external: [
		"$app/stores",
		"$app/navigation",
		"$app/environment",
		"svelte",
		"zod",
		"valibot",
		"@sveltejs/kit",
	],
	entryPoints: {
		"index.svelte": "src/lib/index.ts",
		"adapters/index": "src/lib/adapters/index.ts",
		"adapters/browser/index": "src/lib/adapters/browser.ts",
		"adapters/sveltekit/index": "src/lib/adapters/sveltekit.ts",
	},
});
