import { createUseQueryParams } from "svelte-query-params";
import { sveltekit } from "svelte-query-params/adapters/sveltekit";
import { z } from "zod";

export const useQueryParams = createUseQueryParams(
	{
		count: z.coerce.number().optional().default(0),
	},
	{ adapter: sveltekit() }
);
