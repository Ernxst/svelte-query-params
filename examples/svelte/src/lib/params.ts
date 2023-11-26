import { createUseQueryParams } from "svelte-query-rune";
import { z } from "zod";

export const useQueryParams = createUseQueryParams({
	count: z.coerce.number().optional().default(0),
});
