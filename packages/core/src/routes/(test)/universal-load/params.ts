import { z } from "zod";
import { sveltekit } from "../../../lib/adapters/sveltekit";
import { createUseQueryParams } from "../../../lib/create-params.svelte";

export const useQueryParams = createUseQueryParams(
	{ n: z.coerce.number().optional().default(0) },
	{ adapter: sveltekit() }
);
