/// <reference lib="dom" />
import { tick } from "svelte";
import { dom } from "./adapters/dom";
import type {
	Params,
	QueryParams,
	QueryParamsOptions,
	QuerySchema,
	inferShape,
} from "./types";
import { debounce, mapValues, parseQueryParams } from "./utils";

/**
 * This returns a function (a hook) rather than a reactive object as the
 * reactivity is lost when importing the underlying reactive object around
 * @returns A hook, returning a reactive {@linkcode QueryParams} instance
 */
export function createUseQueryParams<TShape extends QuerySchema>(
	validators: TShape,
	options: QueryParamsOptions = {}
): () => QueryParams<inferShape<TShape>> {
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

	const updateUrl = debounce(async () => {
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
		updateUrl();
	}

	let replaceState: History["replaceState"];
	let pushState: History["pushState"];

	if (windowObj) {
		replaceState = windowObj.history.replaceState.bind(windowObj.history);
		pushState = windowObj.history.pushState.bind(windowObj.history);

		/**
		 * Listening for popstate only works when back/forward button pressed,
		 * so we track things ourselves
		 */
		windowObj.history.replaceState = function (...args) {
			replaceState(...args);
			updateQueryParams();
		};

		windowObj.history.pushState = function (...args) {
			pushState(...args);
			updateQueryParams();
		};

		windowObj.addEventListener("popstate", updateQueryParams);
	}

	const reactive = {} as QueryParams<inferShape<TShape>>;
	for (const key of Object.keys(validators)) {
		Object.defineProperty(reactive, key, {
			get() {
				return query[key];
			},
			set(newValue) {
				setQueryParam(key, newValue);
			},
		});
	}

	Object.defineProperties(reactive, {
		raw: {
			get() {
				return raw;
			},
		},
		query: {
			get() {
				return query;
			},
		},
		search: {
			get() {
				return search;
			},
		},
	});

	return () =>
		Object.assign(reactive, {
			keys() {
				return Object.keys(validators);
			},

			entries() {
				return Object.entries(validators).map(([key]) => [key, query[key]]);
			},

			set(params) {
				raw = mapValues(params, serialise);
				updateUrl();
			},

			update(params) {
				raw = { ...raw, ...mapValues(params, serialise) };
				updateUrl();
			},

			remove(...params) {
				raw = Object.fromEntries(
					Object.entries(raw).filter(([key]) => !params.includes(key))
				);
			},

			unsubscribe() {
				if (windowObj) {
					windowObj.removeEventListener("popstate", updateQueryParams);
					windowObj.history.pushState = pushState;
					windowObj.history.replaceState = replaceState;
				}
			},

			[Symbol.dispose]() {
				this.unsubscribe();
			},
		} satisfies Omit<Params<inferShape<TShape>>, "query" | "raw" | "search">);
}
