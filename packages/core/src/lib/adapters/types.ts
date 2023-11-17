import type { QueryFetcher, QueryUpdater } from "../types";

export interface Adapter {
	/**
	 * If this is not provided, if {@linkcode replace} is `true`, the browser URL
	 * will be updated using {@linkcode History.replaceState}, otherwise the
	 * browser URL will be updated using {@linkcode History.pushState}
	 */
	updateBrowserQuery: QueryUpdater;

	/**
	 * A custom function to retrieve the query string
	 *
	 * @default () => {@linkcode windowObj.location.search}
	 */
	getBrowserQuery: QueryFetcher;
}
