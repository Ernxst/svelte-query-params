import type { Adapter } from "@sveltejs/kit";

export type { Adapter } from "./types.ts";

export function defineAdapter(adapter: Adapter): Adapter {
	return adapter;
}
