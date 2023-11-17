import { get } from "svelte/store";
import type { Adapter } from "./types";
import { goto } from "$app/navigation";
import { page } from "$app/stores";

interface SvelteKitAdapterOptions {
	/**
	 * @default false
	 */
	replace?: boolean;
}

export function sveltekit(options: SvelteKitAdapterOptions = {}): Adapter {
	const { replace = false } = options;
	return {
		getBrowserUrl: () => get(page).url,
		updateBrowserUrl: (search, hash) =>
			goto(`${search}${hash}`, {
				keepFocus: true,
				noScroll: true,
				replaceState: replace,
			}),
	};
}
