import type { QueryFetcher, QueryUpdater } from "../types.ts";

export interface Adapter {
	/**
	 * @returns Whether we are in the browser
	 */
	isBrowser(): boolean;

	/**
	 * Note: The first param includes the `?` prefix
	 */
	updateServerUrl: QueryUpdater;

	/**
	 * Note: The first param includes the `?` prefix
	 */
	updateBrowserUrl: QueryUpdater;

	/**
	 * A custom function to retrieve the URL when in the browser
	 *
	 * @default () => {@linkcode window.location}
	 */
	getBrowserUrl: QueryFetcher;

	/**
	 * A custom function to retrieve the URL when on the server
	 */
	getServerUrl: QueryFetcher;
}
