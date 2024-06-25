import { tick } from "svelte";
import { browser } from "./adapters/browser";
import type {
	QueryHelpers,
	QueryParamsOptions,
	QuerySchema,
	UseQueryHook,
	WindowLike,
	inferShape,
} from "./types";
import {
	debounce,
	diff,
	mapValues,
	objectToQueryString,
	parseQueryParams,
	parseSearchString,
} from "./utils";

/**
 * This returns a function (a hook) rather than a reactive object as the
 * reactivity is lost when importing the underlying reactive object around
 * @returns A hook, returning a reactive {@linkcode QueryHelpers} instance
 */
export function createUseQueryParams<TShape extends QuerySchema>(
	validators: TShape,
	options: QueryParamsOptions = {}
): UseQueryHook<inferShape<TShape>> {
	const {
		debounce: delay = 0,
		windowObj = typeof window === "undefined" ? undefined : window,
		adapter = browser({ windowObj }),
		serialise = (value) =>
			typeof value === "string" ? value : JSON.stringify(value),
	} = options;

	let raw = $state<Record<string, string>>({});
	const query = $derived(parseQueryParams(raw, validators));
	const merged = $derived({ ...raw, ...query });

	function readFromBrowser() {
		raw = parseSearchString(adapter.browser.read().search);
	}

	const persistToBrowser = debounce((search: string, hash: string) => {
		return tick().then(() => adapter.browser.save(search, hash));
	}, delay);

	function persistParams() {
		const search = objectToQueryString(raw);
		adapter.isBrowser()
			? persistToBrowser(search, adapter.browser.read().hash)
			: adapter.server.save(search);
	}

	let unsubscribe: () => void;

	if (windowObj) {
		unsubscribe = addWindowListener(windowObj, readFromBrowser);
	}

	return function useQueryParams(url) {
		raw = parseSearchString(url.search);
		const params = {} as inferShape<TShape>;

		for (const key of Object.keys(query)) {
			Object.defineProperty(params, key, {
				enumerable: true,
				configurable: true,
				get() {
					return query[key];
				},
				set(newValue) {
					const value = serialise(newValue);
					if (value !== raw[key]) {
						raw = { ...raw, [key]: value };
						persistParams();
					}
				},
			});
		}

		if (typeof window !== "undefined" && !unsubscribe) {
			unsubscribe = addWindowListener(window, readFromBrowser);
		}

		return [
			params,
			{
				get raw() {
					return raw;
				},

				get search() {
					return objectToQueryString(raw);
				},

				get all() {
					return merged;
				},

				keys() {
					return Object.keys(query);
				},

				entries() {
					return Object.entries(query).map(([key]) => [key, query[key]]);
				},

				set(params) {
					const updated = mapValues(params, serialise);
					if (diff(raw, updated)) {
						raw = updated;
						persistParams();
					}
				},

				update(params) {
					for (const [key, newValue] of Object.entries(params)) {
						const value = serialise(newValue);
						if (value !== raw[key]) {
							raw = { ...raw, ...mapValues(params, serialise) };
							persistParams();
							break;
						}
					}
				},

				remove(...params) {
					raw = Object.fromEntries(
						Object.entries(raw).filter(([key]) => !params.includes(key))
					);
				},

				unsubscribe() {
					return unsubscribe?.();
				},
			},
		];
	};
}

function addWindowListener(windowObj: WindowLike, update: () => void) {
	// TODO: Need to handle when window.location.search is re-assigned
	const replaceState = windowObj.history.replaceState.bind(windowObj.history);
	const pushState = windowObj.history.pushState.bind(windowObj.history);

	/**
	 * Listening for popstate only works when back/forward button pressed,
	 * so we track things ourselves
	 */
	windowObj.history.replaceState = (...args) => {
		replaceState(...args);
		update();
	};

	windowObj.history.pushState = (...args) => {
		pushState(...args);
		update();
	};

	windowObj.addEventListener("popstate", update);

	return () => {
		windowObj.removeEventListener("popstate", update);
		windowObj.history.pushState = pushState;
		windowObj.history.replaceState = replaceState;
	};
}
