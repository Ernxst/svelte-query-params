import { redirect } from "@sveltejs/kit";
import { browser, building } from "$app/env";
import { goto } from "$app/navigation";
import { page } from "$app/state";
import type { Adapter } from "./types.ts";

export interface SvelteKitAdapterOptions {
	/**
	 * @default false
	 */
	replace?: boolean;
}

const DUMMY_URL = new URL("https://kit.svelte.dev");

export function sveltekit(options: SvelteKitAdapterOptions = {}): Adapter {
	const { replace = false } = options;
	return {
		isBrowser: () => browser,
		browser: {
			reactive: true,
			read() {
				// Query params aren't pre-renderable
				if (building) return DUMMY_URL;
				return page.url;
			},
			save(search, hash) {
				const searchString = search.length ? search : "?";
				goto(`${searchString}${hash}`, { reset: false, replace });
			},
		},
		server: {
			save(search) {
				if (building) return;
				redirect(307, search);
			},
		},
	};
}
