import { createUseQueryParams } from "svelte-query-params";
import { sveltekit } from "svelte-query-params/adapters/sveltekit";
import { z } from "zod";

// Define the schema for pagination parameters
export type Pagination = z.infer<typeof Pagination>;
const Pagination = z.object({
	page: z.coerce.number().default(1),
	pageSize: z.coerce.number().default(10),
});

// Create a custom hook for pagination
export const usePagination = createUseQueryParams(Pagination, {
	adapter: sveltekit(),
});
