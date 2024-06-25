import { createUseQueryParams } from "svelte-query-params";
import { sveltekit } from "svelte-query-params/adapters/sveltekit";
import { z } from "zod";

export type MultiSelect = z.infer<typeof MultiSelect>;
const MultiSelect = z.object({
	categories: z.array(z.string()).default([]),
});

// Create a custom hook for multi-select filters
export const useMultiSelectFilters = createUseQueryParams(MultiSelect, {
	adapter: sveltekit(),
});
