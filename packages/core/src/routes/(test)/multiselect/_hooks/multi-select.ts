import { sveltekit } from "$lib/adapters/sveltekit";
import { createUseQueryParams } from "$lib/create-params.svelte";
import { z } from "zod";

export type MultiSelect = z.infer<typeof MultiSelect>;
const MultiSelect = z.object({
	categories: z
		.union([z.string().array(), z.string()])
		.default([])
		.transform((c) => (Array.isArray(c) ? c : [c])),
});

export const useMultiSelectFilters = createUseQueryParams(MultiSelect, {
	adapter: sveltekit(),
});
