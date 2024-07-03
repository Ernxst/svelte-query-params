import { URLSearchParams as reactive_URLSearchParams } from "svelte/reactivity";
import type { Query } from "./types";

export class ReactiveSearchParams extends reactive_URLSearchParams {
	get raw() {
		const raw: Query = {};

		for (const [key, value] of this.entries()) {
			if (key in raw) {
				const existing = raw[key];
				if (Array.isArray(existing)) {
					existing.push(value);
				} else {
					raw[key] = [existing, value];
				}
			} else {
				raw[key] = value;
			}
		}

		return raw;
	}

	get uniqueKeys() {
		// https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams/size#getting_the_amount_of_search_parameter_entries
		return [...new Set(this.keys())];
	}

	get search() {
		return this.size ? `?${this.toString()}` : "";
	}

	clear() {
		for (const key of this.uniqueKeys) {
			this.delete(key);
		}
	}

	/**
	 * Replaces all query params under the given key with a new array of values
	 */
	set(key: string, values: string | string[]) {
		if (Array.isArray(values)) {
			this.delete(key);

			for (const arrayValue of values) {
				this.append(key, arrayValue);
			}
		} else {
			super.set(key, values);
		}
	}

	setFromObject(query: Query) {
		for (const [key, value] of Object.entries(query)) {
			this.set(key, value);
		}
	}

	setFromSearch(query: string) {
		this.clear();
		const params = new URLSearchParams(query);

		for (const [key, value] of params.entries()) {
			this.append(key, value);
		}
	}

	changed(key: string, value: string | string[]): boolean {
		const compare = Array.isArray(value) ? value : [value];
		const existing = this.getAll(key).sort();
		if (compare.length !== existing.length) return true;

		const sortedNew = [...compare].sort();

		for (let i = 0; i < existing.length; i++) {
			if (existing[i] !== sortedNew[i]) return true;
		}

		return false;
	}

	equals(params: Record<string, string | string[]>): boolean {
		const paramKeys = Object.keys(params);
		if (this.uniqueKeys.length !== paramKeys.length) return false;

		for (const key of this.uniqueKeys) {
			if (this.changed(key, params[key])) return false;
		}

		return true;
	}
}
