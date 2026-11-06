import { defineConfig } from "tsup";

export default defineConfig({
	format: ["esm", "cjs"],
	// tsup 8 sets `baseUrl`, which TypeScript 6 deprecates
	dts: { compilerOptions: { ignoreDeprecations: "6.0" } },
	sourcemap: false,
	bundle: true,
	clean: true,
	splitting: false,
	external: [
		"$app/navigation",
		"$app/env",
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
