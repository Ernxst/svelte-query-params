import * as v from "valibot";
import { sveltekit } from "../../../lib/adapters/sveltekit";
import { createUseQueryParams } from "../../../lib/create-params.svelte";

export const useQueryParams = createUseQueryParams(
	v.object({ q: v.optional(v.string(), "") }),
	{ adapter: sveltekit() }
);
