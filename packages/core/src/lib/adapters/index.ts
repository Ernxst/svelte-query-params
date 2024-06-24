import type { Adapter } from "@sveltejs/kit";

export type {
	Adapter,
	BrowserAdapter,
	ServerAdapter,
} from "./types.ts";

export function defineAdapter(adapter: Adapter): Adapter {
	return adapter;
}
