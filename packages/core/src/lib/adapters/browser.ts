import type { QueryParamsOptions } from "../types.ts";
import type { Adapter } from "./types.ts";

export interface BrowserAdapterOptions
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

/**
 * Browser only adapter, does nothing when on the server
 */
export function browser(options: BrowserAdapterOptions = {}): Adapter {
	const { windowObj = window, replace = false } = options;

	/** Get the function ahead of time so we don't need an if statement every call */
	const replaceState = windowObj.history.replaceState.bind(windowObj.history);
	const pushState = windowObj.history.pushState.bind(windowObj.history);
	const update = replace ? replaceState : pushState;

	return {
		isBrowser: () => typeof window !== "undefined",
		browser: {
			read: () => windowObj.location,
			save: (search, hash) =>
				update(null, "", `${search.length ? search : "?"}${hash}`),
		},
		server: {
			save: () => {},
		},
	};
}
