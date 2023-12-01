/// <reference lib="dom" />
import type { QueryParamsOptions } from "../types.ts";
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

// Called it the dom adapter as there's noting svelte about it

export function dom(options: DomAdapterOptions = {}): Adapter {
	const { windowObj = window, replace = false } = options;

	/** Get the function ahead of time so we don't need an if statement every call */
	const replaceState = windowObj.history.replaceState.bind(windowObj.history);
	const pushState = windowObj.history.pushState.bind(windowObj.history);
	const update = replace ? replaceState : pushState;

	return {
		isBrowser: () => typeof window !== "undefined",
		getBrowserUrl: () => windowObj.location,
		updateBrowserUrl: (search, hash) => update(null, "", `${search}${hash}`),
		// Client-side only adapter
		getServerUrl: () => ({ hash: "", search: "" }),
		updateServerUrl: () => {},
	};
}
