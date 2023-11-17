import { get } from "svelte/store";
import type { Adapter } from "./types";
import { goto } from "$app/navigation";
import { page } from "$app/stores";
import { browser } from "$app/environment";

interface SvelteKitAdapterOptions {
	/**
	 * @default false
	 */
	replace?: boolean;
}

export function sveltekit(options: SvelteKitAdapterOptions = {}): Adapter {
	const { replace = false } = options;
	return {
		getBrowserUrl: () => (browser ? window.location : get(page).url),
		updateBrowserUrl: (search, hash) =>
			goto(`${search}${hash}`, {
				keepFocus: true,
				noScroll: true,
				replaceState: replace,
			}),
	};
}
