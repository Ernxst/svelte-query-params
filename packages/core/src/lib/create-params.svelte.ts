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
		windowObj = window,
		adapter = dom({ windowObj }),
		serialise = createDefaultSerializer(),
	} = options;

	let raw = $state(getBrowserQueryParams());

	const query = $derived(parseQueryParams(raw, validators));
	const search = $derived(
		Object.keys(query).length ? `?${new URLSearchParams(query)}` : ""
	);

	const set = (key: string, value: any) => {
		if (value === undefined) {
			// We need to assign it so it updates, property updates do nothing
			const { [key]: _, ...rest } = raw;
			raw = rest;
		} else {
			// We need to assign it so it updates, property updates do nothing
			raw = { ...raw, [key]: serialise(value) };
		}
		tick().then(() => adapter.updateBrowserQuery(search));
	};

	const reactive = $derived(
		Object.fromEntries(
			Object.keys(query).map((key) => {
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
							set(key, value);
						},
						set(value: any) {
							set(key, value);
						},
					},
				];
			})
		)
	);

	function updateQueryParams() {
		raw = getBrowserQueryParams();
	}

	function getBrowserQueryParams() {
		const queryParams = new URLSearchParams(adapter.getBrowserQuery());
		return entriesToRecord(Array.from(queryParams));
	}

	const replaceState = windowObj.history.replaceState.bind(windowObj.history);
	const pushState = windowObj.history.pushState.bind(windowObj.history);

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
			tick().then(() => adapter.updateBrowserQuery(search));
		},

		toJSON() {
			return query;
		},

		toString() {
			console.log("aaa", JSON.stringify(query));
			return JSON.stringify(query);
		},

		dispose() {
			windowObj.removeEventListener("popstate", updateQueryParams);
			windowObj.history.pushState = pushState;
			windowObj.history.replaceState = replaceState;
		},

		[Symbol.dispose]() {
			this.dispose();
		},
	});
}
