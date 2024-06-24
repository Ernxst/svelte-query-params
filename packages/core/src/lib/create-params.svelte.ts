import { tick } from "svelte";
import { browser } from "./adapters/browser";
import type {
	QueryHelpers,
	QueryParamsOptions,
	QuerySchema,
	UseQueryHook,
	inferShape,
} from "./types";
import {
	debounce,
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

	function readFromBrowser() {
		raw = parseSearchString(adapter.browser.read().search);
	}

	const persistToBrowser = debounce((search: string, hash: string) => {
		return tick().then(() => adapter.browser.save(search, hash));
	}, delay);

	function persistParams() {
		/**
		 * The derived values above aren't updated by the time this method is called,
		 * so we must recompute it.
		 *
		 * We could do things in an effect, but you can't run effects on the server.
		 * Can't do a `tick` because we throw a redirect when updating server url
		 * which makes SvelteKit throw an async error instead of redirecting
		 */
		const query = parseQueryParams(raw, validators);
		const search = objectToQueryString(query);
		adapter.isBrowser()
			? // By the time peristParams is called in the browser, a hash may have changed due to reactivity
				persistToBrowser(search, adapter.browser.read().hash)
			: // We don't have this problem on the server
				adapter.server.save(search, "");
	}

	let unsubscribe = () => {};

	if (windowObj) {
		const replaceState = windowObj.history.replaceState.bind(windowObj.history);
		const pushState = windowObj.history.pushState.bind(windowObj.history);

		/**
		 * Listening for popstate only works when back/forward button pressed,
		 * so we track things ourselves
		 */
		windowObj.history.replaceState = (...args) => {
			replaceState(...args);
			readFromBrowser();
		};

		windowObj.history.pushState = (...args) => {
			pushState(...args);
			readFromBrowser();
		};

		windowObj.addEventListener("popstate", readFromBrowser);

		unsubscribe = () => {
			if (windowObj) {
				windowObj.removeEventListener("popstate", readFromBrowser);
				windowObj.history.pushState = pushState;
				windowObj.history.replaceState = replaceState;
			}
		};
	}

	return function useQueryParams(url) {
		raw = parseSearchString(url.search);
		const params = {} as inferShape<TShape>;

		for (const key of Object.keys(validators)) {
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

		return [
			params,
			{
				get raw() {
					return raw;
				},

				get query() {
					return query;
				},

				get search() {
					return objectToQueryString(query);
				},

				get all() {
					return { ...raw, ...query };
				},

				keys() {
					return Object.keys(validators);
				},

				entries() {
					return Object.entries(validators).map(([key]) => [key, query[key]]);
				},

				set(params) {
					raw = mapValues(params, serialise);
					persistParams();
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
					return unsubscribe();
				},
			},
		];
	};
}
