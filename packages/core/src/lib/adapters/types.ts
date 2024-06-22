import type { URLLike } from "../types.ts";

export interface Adapter {
	/**
	 * @returns Whether we are in the browser
	 */
	isBrowser(): boolean;
	browser: BrowserAdapter;
	server: ServerAdapter;
}

export interface BaseAdapter {
	/**
	 * A function to update the URL.
	 *
	 * Note: The first param includes the `?` prefix and the second param
	 * includes the `#` if there is a hash
	 */
	save: (search: string, hash: string) => void;
}

export interface BrowserAdapter extends BaseAdapter {
	/**
	 * A function to retrieve the URL when in the browser
	 */
	read: () => URLLike;
}

export interface ServerAdapter extends BaseAdapter {}
