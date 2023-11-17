import { z } from "zod";
import { createUseQueryParams } from "svelte-query-rune";

export const useQueryParams = createUseQueryParams({
	count: z.coerce.number().optional().default(0),
});
