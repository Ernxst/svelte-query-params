import type { QueryFetcher, QueryUpdater } from "../types.ts";

export interface Adapter {
	/**
	 * The first param includes the `?` prefix
	 */
	updateBrowserUrl: QueryUpdater;

	/**
	 * A custom function to retrieve the query string
	 *
	 * @default () => {@linkcode window.location}
	 */
	getBrowserUrl: QueryFetcher;
}
