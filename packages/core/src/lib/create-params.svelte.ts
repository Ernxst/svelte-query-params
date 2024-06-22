import { tick } from "svelte";
import { dom } from "./adapters/dom";
import type {
	QueryHelpers,
	QueryParamsOptions,
	QuerySchema,
	UseQueryHook,
	inferShape,
} from "./types";
import { debounce, fromURL, mapValues, parseQueryParams } from "./utils";

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
		adapter = dom({ windowObj }),
		serialise = (value) =>
			typeof value === "string" ? value : JSON.stringify(value),
	} = options;

	let raw = $state({});
	const query = $derived(parseQueryParams(raw, validators));
	const search = $derived(`?${new URLSearchParams(query)}`);

	function readFromBrowser() {
		raw = fromURL(adapter.browser.read());
	}

	const persistToBrowser = debounce((search: string, hash: string) => {
		return tick().then(() => adapter.browser.save(search, hash));
	}, delay);

	function persistParams(hash: string) {
		adapter.isBrowser()
			? // By the time peristParams is called in the browser, a hash may have changed due to reactivity
				persistToBrowser(search, adapter.browser.read().hash)
			: // We don't have this problem on the server
				adapter.server.save(search, hash);
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
		raw = fromURL({ search: url.search });
		const params = {} as inferShape<TShape>;

		for (const key of Object.keys(validators)) {
			Object.defineProperty(params, key, {
				enumerable: true,
				configurable: true,
				get() {
					return query[key];
				},
				set(newValue) {
					raw = { ...raw, [key]: serialise(newValue) };
					persistParams(url.hash);
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
					return search;
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
					persistParams(url.hash);
				},

				update(params) {
					raw = { ...raw, ...mapValues(params, serialise) };
					persistParams(url.hash);
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
