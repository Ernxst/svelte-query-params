/// <reference lib="dom" />
import type {
	QueryFetcher,
	QueryParamsOptions,
	QueryUpdater,
} from "../types.ts";
import type { Adapter } from "./types.ts";

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

function createQueryFetcher(
	windowObj: Pick<typeof window, "location">
): QueryFetcher {
	return () => windowObj.location;
}

function createQueryUpdater(
	replace: boolean,
	{ replaceState, pushState }: Pick<History, "replaceState" | "pushState">
): QueryUpdater {
	const update = replace ? replaceState : pushState;
	/** Get the function ahead of time so we don't need an if statement every call */
	return (search, hash) => update(null, "", `${search}${hash}`);
}

// Called it the dom adapter as there's noting svelte about it

export function dom(options: DomAdapterOptions = {}): Adapter {
	const { windowObj = window, replace = false } = options;

	const replaceState = windowObj.history.replaceState.bind(windowObj.history);
	const pushState = windowObj.history.pushState.bind(windowObj.history);

	return {
		isBrowser: () => typeof window !== 'undefined',
		getBrowserUrl: createQueryFetcher(windowObj),
		updateBrowserUrl: createQueryUpdater(replace, { replaceState, pushState }),
		// Client-side only adapter
		getServerUrl: () => ({ hash: '', search: '' }),
		updateServerUrl: () => {}
	};
}
