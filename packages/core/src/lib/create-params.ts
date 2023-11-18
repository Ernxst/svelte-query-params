import { tick } from "svelte";
import type { FormEventHandler } from "svelte/elements";
import { dom } from "./adapters/dom";
import type {
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
 * @returns A hook, returning a reactive {@linkcode QueryParams} instance
 */
export function createUseQueryParams<TShape extends QuerySchema>(
	validators: TShape,
	options: QueryParamsOptions = {}
): () => QueryParams<TShape> {
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

	const reactive = $derived(
		Object.fromEntries(
			Object.keys(validators).map((key) => {
				console.log(query, key);
				return [
					key,
					{
						valueOf() {
							return query[key];
						},
						toString() {
							return `${query[key]}`;
						},
						toJSON() {
							return query[key];
						},
						oninput(event: Parameters<FormEventHandler<any>>[0]) {
							const value = (event.target as any)?.value;
							setQueryParam(key, value);
						},
						set(value: any) {
							setQueryParam(key, value);
						},
					},
				];
			})
		)
	);

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

	const keys = $derived(Object.keys(query));
	const entries = $derived<any>(Object.entries(reactive));

	return () => ({
		...(reactive as inferShape<TShape>),

		get raw() {
			return raw;
		},

		get query() {
			return query;
		},

		get search() {
			return search;
		},

		keys() {
			return keys;
		},

		entries() {
			return entries;
		},

		set(params) {
			raw = mapValues(params, serialise);
			updateBrowserUrl();
		},

		toJSON() {
			return query;
		},

		toString() {
			return JSON.stringify(query);
		},

		dispose() {
			if (windowObj) {
				windowObj.removeEventListener("popstate", updateQueryParams);
				windowObj.history.pushState = pushState;
				windowObj.history.replaceState = replaceState;
			}
		},

		[Symbol.dispose]() {
			this.dispose();
		},
	});
}
