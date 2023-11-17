import type { QueryFetcher, QueryUpdater } from "../types";

export interface Adapter {
	/**
	 * The first param includes the `?` prefix
	 */
	updateBrowserUrl: QueryUpdater;

	/**
	 * A custom function to retrieve the query string
	 *
	 * @default () => {@linkcode windowObj.location}
	 */
	getBrowserUrl: QueryFetcher;
}
