/// <reference lib="dom" />
import type { BaseSchema, Output } from "valibot";
import type { z } from "zod";
import type { Adapter } from "./adapters/types.ts";

/** Use this over valibot AnySchema type as we need to widen the type of `schema` to be any string */
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export type AnySchema<TOutput = any> = BaseSchema<any, TOutput> & {
	schema: string;
};
export type ValibotValidator = AnySchema;
export type FunctionValidator<TOut = unknown> = (value?: string) => TOut;
export type ZodValidator = z.ZodType;
export type Validator = FunctionValidator | ZodValidator | ValibotValidator;

export type inferFromValidator<TValidator extends Validator> =
	TValidator extends ZodValidator
		? z.infer<TValidator>
		: TValidator extends ValibotValidator
		? Output<TValidator>
		: TValidator extends FunctionValidator
		? ReturnType<TValidator>
		: never;

export type QuerySchema = Record<string, Validator>;

export type inferShape<TShape extends QuerySchema> = {
	[K in keyof TShape]: inferFromValidator<TShape[K]>;
} & {};

/**
 * @param search Includes the `?` prefix
 */
export type QueryUpdater = (search: string, hash: string) => void;
export type QueryFetcher = () => { search: string; hash: string };
export type Serializer = (value: unknown) => string;

export interface QueryParamsOptions {
	/**
	 * Provide a custom implementation of {@linkcode window}. It requires
	 * {@linkcode window.location}, {@linkcode window.history},
	 * {@linkcode window.addEventListener} and {@linkcode window.removeEventListener}
	 *
	 * @default window
	 */
	windowObj?: Pick<
		typeof window,
		"location" | "history" | "addEventListener" | "removeEventListener"
	>;

	/**
	 * Add a delay (in ms) before updating the browser URL. This is useful in
	 * situations where URL updates happen frequently, e.g., on every keystroke.
	 *
	 * Note this does not affect the query params rune - this will always be
	 * updated optimistically.
	 *
	 * @default 0
	 */
	debounce?: number;

	/**
	 * Control how query params are serialised to the browser query params
	 *
	 * **Note**: this is NOT for encoding values into URI components - it is
	 * for serialising values into strings, which will then be encoded
	 * internally.
	 */
	serialise?: Serializer;

	adapter?: Adapter;
}

export type QueryParams<TShape extends Record<string, unknown>> = TShape &
	Params<TShape>;

export interface Params<TShape extends object> {
	/** The raw query params, parsed from {@linkcode windowObj.location.href} */
	readonly raw: Record<string, string>;
	/** The unmodified query params parsed from the {@linkcode raw} params */
	readonly query: TShape;
	/** The query string, generated from the {@linkcode query} */
	readonly search: string;
	/** Replace _ALL_ query params, triggering a reactive and browser update */
	set(params: TShape): void;
	/** Update a subset of the query params, triggering a reactive and browser update */
	update(params: Partial<TShape>): void;
	/** Remove query params. Note that this may cause your validation check to fail */
	remove(...params: (keyof TShape)[]): void;
	/** Manually unset unregister all event listeners */
	unsubscribe(): void;
	/** Return the query keys. Unlike {@linkcode Object.keys}, this is type-safe */
	keys(): (keyof TShape)[];
	entries(): [keyof TShape, TShape[keyof TShape]][];
	[Symbol.dispose]: () => void;
}
