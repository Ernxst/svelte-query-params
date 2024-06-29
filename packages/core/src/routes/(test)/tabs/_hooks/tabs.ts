import { sveltekit } from "$lib/adapters/sveltekit";
import { createUseQueryParams } from "$lib/create-params.svelte";
import * as v from "valibot";

export type Tabs = v.InferOutput<typeof Tabs>;
const Tabs = v.object({
	tab: v.optional(v.picklist(["home", "users"]), "home"),
});

export const useTabs = createUseQueryParams(Tabs, { adapter: sveltekit() });
