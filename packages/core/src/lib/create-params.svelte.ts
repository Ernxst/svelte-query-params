import { tick } from "svelte";
import { browser } from "./adapters/browser";
import { ReactiveSearchParams } from "./search-params";
import type {
	QueryHelpers,
	QueryParamsOptions,
	QuerySchema,
	UseQueryHook,
	WindowLike,
	inferShape,
} from "./types";
import { debounce, mapValues, parseQueryParams } from "./utils";

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
		// TODO: Do we need a deserialiser ?
		serialise = (value) =>
			typeof value === "string" ? value : JSON.stringify(value),
	} = options;

	// TODO: Do we need this or can we just store each field as an array of values? smaller bundle
	const searchParams = new ReactiveSearchParams();
	const parsedQuery = $derived(parseQueryParams(searchParams.raw, validators));

	function readFromBrowser() {
		searchParams.setFromSearch(adapter.browser.read().search);
	}

	const persistToBrowser = debounce((search: string, hash: string) => {
		return tick().then(() => adapter.browser.save(search, hash));
	}, delay);

	function persistParams() {
		adapter.isBrowser()
			? persistToBrowser(searchParams.search, adapter.browser.read().hash)
			: adapter.server.save(searchParams.search);
	}

	function serialiseValue(value: unknown) {
		return Array.isArray(value) ? value.map(serialise) : serialise(value);
	}

	let unsubscribe: () => void;

	if (windowObj) {
		unsubscribe = addWindowListener(windowObj, readFromBrowser);
	}

	return function useQueryParams(url) {
		searchParams.setFromSearch(url.search);
		const params = {} as inferShape<TShape>;

		for (const key of Object.keys(parsedQuery)) {
			Object.defineProperty(params, key, {
				enumerable: true,
				configurable: true,
				get() {
					return parsedQuery[key];
				},
				set(newValue) {
					const value = serialiseValue(newValue);
					if (searchParams.changed(key, value)) {
						searchParams.setFromObject({ [key]: value });
						persistParams();
					}
				},
			});
		}

		if (typeof window !== "undefined" && !unsubscribe) {
			unsubscribe = addWindowListener(window, readFromBrowser);
		}

		// TODO: This is needed to write default values to the url, do we want this?
		// searchParams.setFromObject(parsedQuery);

		return [
			params,
			{
				get raw() {
					return searchParams.raw;
				},

				get search() {
					return searchParams.search;
				},

				get all() {
					return { ...searchParams.raw, ...parsedQuery };
				},

				keys() {
					return Object.keys(parsedQuery);
				},

				entries() {
					return Object.entries(parsedQuery);
				},

				set(params) {
					const updated = mapValues(params, serialiseValue);
					if (!searchParams.equals(updated)) {
						searchParams.clear();
						searchParams.setFromObject(updated);
						persistParams();
					}
				},

				update(params) {
					const updated = mapValues(params, serialiseValue);
					if (!searchParams.equals(updated)) {
						searchParams.setFromObject(updated);
						persistParams();
					}
				},

				remove(...params) {
					params.map((param) => searchParams.delete(param as string));
				},

				unsubscribe() {
					return unsubscribe?.();
				},
			},
		];
	};
}

function addWindowListener(windowObj: WindowLike, update: () => void) {
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
