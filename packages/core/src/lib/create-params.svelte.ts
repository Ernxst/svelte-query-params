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
import {
	createDefaultSerializer,
	debounce,
	entriesToRecord,
	mapValues,
	parseQueryParams,
} from "./utils";

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
		serialise = createDefaultSerializer(),
	} = options;

	let raw = $state(getBrowserQueryParams());

	const query = $derived(parseQueryParams(raw, validators));
	const search = $derived(
		Object.keys(query).length ? `?${new URLSearchParams(query)}` : ""
	);

	function getBrowserQueryParams() {
		const { search } = adapter.getBrowserUrl();
		const queryParams = new URLSearchParams(search);
		return entriesToRecord(Array.from(queryParams));
	}

	async function updateAfterTick() {
		await tick();
		adapter.updateBrowserUrl(search, adapter.getBrowserUrl().hash);
	}

	const updateBrowserUrl =
		delay === 0 ? updateAfterTick : debounce(updateAfterTick, delay);

	function updateQueryParams() {
		raw = getBrowserQueryParams();
	}

	function setQueryParam(key: string, value: any) {
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
	Object.keys(validators).forEach((key) => {
		Object.defineProperty(reactive, key, {
			get() {
				return query[key];
			},
			set(newValue) {
				setQueryParam(key, newValue);
			},
		});
	});

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
				return Object.entries(validators).map(
					([key]) => [key, query[key]] as any
				);
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
