import { browser, building } from "$app/environment";
import { goto } from "$app/navigation";
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
			read() {
				// Query params aren't pre-renderable
				if (building) return DUMMY_URL;
				return window.location;
			},
			save(search, hash) {
				goto(`${search}${hash}`, {
					keepFocus: true,
					noScroll: true,
					replaceState: replace,
				});
			},
		},
		server: {
			save(_search, _hash) {
				// TODO: Currently causes infinite redirects
				// if (building) return;
				// redirect(307, `${search}${hash}`);
			},
		},
	};
}
