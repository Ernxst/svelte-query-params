/// <reference lib="dom" />
import { tick } from "svelte";
import { dom } from "./adapters/dom";
import type {
	QueryHelpers,
	QueryParamsOptions,
	QuerySchema,
	UseQueryHook,
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
		adapter = dom({ windowObj }),
		serialise = (value) =>
			typeof value === "string" ? value : JSON.stringify(value),
	} = options;

	let raw = $state(getQueryParams());

	const query = $derived(parseQueryParams(raw, validators));
	const search = $derived(
		Object.keys(query).length ? `?${new URLSearchParams(query)}` : ""
	);

	function getQueryParams() {
		const getParams = adapter.isBrowser()
			? adapter.getBrowserUrl
			: adapter.getServerUrl;
		const { search } = getParams();
		const queryParams = new URLSearchParams(search);
		return Object.fromEntries(queryParams.entries());
	}

	const updateBrowserUrl = debounce(async () => {
		await tick();

		if (adapter.isBrowser()) {
			adapter.updateBrowserUrl(search, adapter.getBrowserUrl().hash);
		} else {
			adapter.updateServerUrl(search, adapter.getServerUrl().hash);
		}
	}, delay);

	function updateQueryParams() {
		raw = getQueryParams();
	}

	function setQueryParam(key: string, value: unknown) {
		if (value === undefined) {
			// We need to assign it so it updates, property updates do nothing
			const { [key]: _, ...rest } = raw;
			raw = rest;
		} else {
			// We need to assign it so it updates, property updates do nothing
			raw = { ...raw, [key]: serialise(value) };
		}

		updateBrowserUrl();
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
			updateQueryParams();
		};

		windowObj.history.pushState = (...args) => {
			pushState(...args);
			updateQueryParams();
		};

		windowObj.addEventListener("popstate", updateQueryParams);

		unsubscribe = () => {
			if (windowObj) {
				windowObj.removeEventListener("popstate", updateQueryParams);
				windowObj.history.pushState = pushState;
				windowObj.history.replaceState = replaceState;
			}
		};
	}

	return function useQueryParams() {
		const params = {} as inferShape<TShape>;

		/** This makes the properties reactive without manual getters/setters */
		for (const key of Object.keys(validators)) {
			Object.defineProperty(params, key, {
				enumerable: true,
				configurable: true,
				get() {
					return query[key];
				},
				set(newValue) {
					setQueryParam(key, newValue);
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
					updateBrowserUrl();
				},

				update(params) {
					raw = { ...raw, ...mapValues(params, serialise) };
					updateBrowserUrl();
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
