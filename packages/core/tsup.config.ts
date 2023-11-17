import { defineConfig } from "tsup";

export default defineConfig({
	format: ["esm", "cjs"],
	dts: true,
	sourcemap: true,
	bundle: true,
	clean: true,
	entryPoints: {
		"index.svelte": "src/index.ts",
		"adapters/index": "src/adapters/index.ts",
		"adapters/dom/index": "src/adapters/dom.ts",
	},
});
