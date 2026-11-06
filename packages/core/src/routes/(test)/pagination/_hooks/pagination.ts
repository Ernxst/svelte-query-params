import { z } from "zod";
import { sveltekit } from "../../../../lib/adapters/sveltekit";
import { createUseQueryParams } from "../../../../lib/create-params.svelte";

export type Pagination = z.infer<typeof Pagination>;
const Pagination = z.object({
	page: z.coerce.number().default(1),
	pageSize: z.coerce.number().default(10),
});

export const usePagination = createUseQueryParams(Pagination, {
	adapter: sveltekit(),
});
