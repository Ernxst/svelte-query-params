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
	 * A function to update the browser URL.
	 *
	 * Note: The first param includes the `?` prefix and the second param
	 * includes the `#` if there is a hash
	 */
	save: (search: string, hash: string) => void;
}

export interface ServerAdapter {
	/**
	 * A function to update the server URL.
	 *
	 * Note: The first param includes the `?
	 */
	save: (search: string) => void;
}
