import { browser, building } from "$app/environment";
import { goto } from "$app/navigation";
import { page } from "$app/stores";
import { get } from "svelte/store";
import type { Adapter } from "./types.ts";

interface SvelteKitAdapterOptions {
	/**
	 * @default false
	 */
	replace?: boolean;
}

export function sveltekit(options: SvelteKitAdapterOptions = {}): Adapter {
	const { replace = false } = options;
	return {
		isBrowser: () => browser,
		getBrowserUrl: () => {
			// Query params aren't pre-renderable
			if (building) return { hash: "", search: "" };
			return window.location;
		},
		updateBrowserUrl: (search, hash) =>
			goto(`${search}${hash}`, {
				keepFocus: true,
				noScroll: true,
				replaceState: replace,
			}),
		getServerUrl: () => {
			// Query params aren't pre-renderable
			if (building) return { hash: "", search: "" };
			return get(page).url;
		},
		updateServerUrl: (_search, _hash) => {},
	};
}
