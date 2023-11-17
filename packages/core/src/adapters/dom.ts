/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
import type { QueryFetcher, QueryParamsOptions, QueryUpdater } from "../types";
import type { Adapter } from "./types";

export interface DomAdapterOptions
	extends Pick<QueryParamsOptions, "windowObj"> {
	/**
	 * If `true`, the browser URL will be updated using
	 * {@linkcode History.replaceState}, otherwise the browser URL will be
	 * updated using {@linkcode History.pushState}
	 *
	 * @default false
	 */
	replace?: boolean;
}

function createDefaultQueryFetcher(
	windowObj: Pick<typeof window, "location">
): QueryFetcher {
	return () => windowObj.location.search;
}

function createDefaultQueryUpdater(
	replace: boolean,
	{ replaceState, pushState }: Pick<History, "replaceState" | "pushState">
): QueryUpdater {
	/** Get the function ahead of time so we don't need an if statement every call */
	return replace
		? (search) => replaceState(null, "", search)
		: (search) => pushState(null, "", search);
}

export function dom(options: DomAdapterOptions): Adapter {
	const { windowObj = window, replace = false } = options;

	const replaceState = windowObj.history.replaceState.bind(windowObj.history);
	const pushState = windowObj.history.pushState.bind(windowObj.history);

	return {
		getBrowserQuery: createDefaultQueryFetcher(windowObj),
		updateBrowserQuery: createDefaultQueryUpdater(replace, {
			replaceState,
			pushState,
		}),
	};
}
