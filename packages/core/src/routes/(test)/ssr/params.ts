import { sveltekit } from "$lib/adapters/sveltekit";
import { createUseQueryParams } from "$lib/create-params.svelte";
import { z } from "zod";

export const useQueryParams = createUseQueryParams(
	{
		count: z.coerce.number().optional().default(0),
	},
	{ adapter: sveltekit() }
);
