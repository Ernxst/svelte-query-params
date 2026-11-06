import type { URLLike } from "../types.ts";

export interface Adapter {
	/**
	 * @returns Whether we are in the browser
	 */
	isBrowser(): boolean;
	browser: BrowserAdapter;
	server: ServerAdapter;
}

export interface BrowserAdapter {
	/**
	 * A function to retrieve the URL when in the browser
	 */
	read: () => URLLike;
	/**
	 * Set this when {@linkcode read} is backed by reactive state, such as
	 * SvelteKit's `page.url`. The query params then re-read the URL whenever it
	 * changes, and the browser's history methods are left alone.
	 *
	 * @default false
	 */
	reactive?: boolean;
	/**
	 * A function to update the browser query params and hash.
	 *
	 * @param search The search string - includes the `?` prefix if there are query params, otherwise an empty string
	 * @param hash The fragment  - includes the `#` prefix if there is a hash, otherwise an empty string
	 */
	save: (search: string, hash: string) => void;
}

export interface ServerAdapter {
	/**
	 * A function to update the server query params.
	 *
	 * @param search The search string - includes the `?` prefix if there are query params, otherwise an empty string
	 */
	save: (search: string) => void;
}
