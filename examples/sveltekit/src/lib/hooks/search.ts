import { createUseQueryParams } from "svelte-query-params";
import { sveltekit } from "svelte-query-params/adapters/sveltekit";
import { z } from "zod";

export type Search = z.infer<typeof Search>;
const Search = z.object({
	q: z.string().default(""),
	category: z.string().optional(),
});

// Create a custom hook for search filters
export const useSearchFilters = createUseQueryParams(Search, {
	debounce: 250,
	adapter: sveltekit(),
});
