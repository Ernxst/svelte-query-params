import { sveltekit } from "$lib/adapters/sveltekit";
import { createUseQueryParams } from "$lib/create-params.svelte";
import * as v from "valibot";

export type Search = v.InferOutput<typeof Search>;
const Search = v.object({
	q: v.optional(v.string(), ""),
	category: v.optional(v.string()),
});

export const useSearchFilters = createUseQueryParams(Search, {
	debounce: 1000,
	adapter: sveltekit(),
});
