import { get } from "svelte/store";
import type { Adapter } from "./types";
import { page } from "$app/stores";
import { goto } from "$app/navigation";

interface SvelteKitAdapterOptions {
	replace?: boolean
}

export function sveltekit(options: SvelteKitAdapterOptions = {}): Adapter {
	const { replace = false } = options
	return {
		getBrowserQuery: () => get(page).url.search,
		updateBrowserQuery: (search) => goto(`?${search}`, {
			keepFocus: true,
			noScroll: true,
			replaceState: replace,
		}),
	};
}
