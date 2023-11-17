import { z } from "zod";
import { createUseQueryParams } from "svelte-query-rune";
import { sveltekit } from "svelte-query-rune/adapters/sveltekit";

export const useQueryParams = createUseQueryParams(
	{
		count: z.coerce.number().optional().default(0),
	},
	{ adapter: sveltekit() }
);
