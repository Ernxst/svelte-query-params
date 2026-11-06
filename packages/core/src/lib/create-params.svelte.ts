import { tick, untrack } from "svelte";
import { browser } from "./adapters/browser";
import { ReactiveSearchParams } from "./search-params";
import type {
	inferShape,
	QueryHelpers,
	QueryParamsOptions,
	QuerySchema,
	UseQueryHook,
	WindowLike,
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
		serialise = (value) =>
			typeof value === "string" ? value : JSON.stringify(value),
	} = options;

	const reactive = adapter.browser.reactive === true;
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

	/**
	 * Re-reads the adapter's URL when it changes. This must run while a
	 * component initialises as it creates an effect.
	 *
	 * @returns `false` when there is no component to own the effect
	 */
	function watchAdapterUrl() {
		try {
			$effect.pre(() => {
				// Read outside `untrack` so the effect depends on the adapter's URL
				// and not on the params it writes to
				const { search } = adapter.browser.read();
				untrack(() => searchParams.setFromSearch(search));
			});
			return true;
		} catch (error) {
			if (String(error).includes("effect_orphan")) return false;
			throw error;
		}
	}

	let unsubscribe: () => void;

	if (windowObj && !reactive) {
		unsubscribe = addWindowListener(windowObj, readFromBrowser);
	}

	return function useQueryParams(url) {
		searchParams.setFromSearch(url.search);
		if (reactive && !watchAdapterUrl()) {
			// Outside a component, e.g. in a universal `load`, there is no effect
			// to host the watcher, so listen to the window instead
			if (typeof window !== "undefined" && !unsubscribe) {
				unsubscribe = addWindowListener(window, () =>
					searchParams.setFromSearch(window.location.search)
				);
			}
		}
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

		if (typeof window !== "undefined" && !unsubscribe && !reactive) {
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
					persistParams();
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
