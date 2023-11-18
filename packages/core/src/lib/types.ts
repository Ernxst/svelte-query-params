/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
import type { z } from "zod";
import type { FormEventHandler } from "svelte/elements";
import type { AnySchema, Output } from "valibot";
import type { Adapter } from "./adapters/types";

type ZodValidator =
	| z.ZodString
	| z.ZodNumber
	| z.ZodDefault<ZodValidator>
	| z.ZodOptional<ZodValidator>;

type ValibotValidator = AnySchema;

export type Validator = FunctionValidator | ZodValidator | ValibotValidator;

export type FunctionValidator<TOut = any> = (value?: string) => TOut;

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
	// eslint-disable-next-line @typescript-eslint/ban-types
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

export type QueryParams<TShape extends QuerySchema> = EnhanceParams<
	inferShape<TShape>
> &
	Params<inferShape<TShape>>;

interface Params<TShape extends object> {
	/** The raw query params, parsed from {@linkcode windowObj.location.href} */
	readonly raw: Record<string, string>;
	/** The unmodified query params parsed from the {@linkcode raw} params */
	readonly query: TShape;
	/** The query string, generated from the {@linkcode query} */
	readonly search: string;
	/** Replace _ALL_ query params, triggering a reactive and browser update */
	set(params: TShape): void;
	/** Manually unset unregister all event listeners */
	dispose(): void;
	/** Return the query keys. Unlike {@linkcode Object.keys}, this is type-safe */
	keys(): (keyof TShape)[];
	entries(): [keyof TShape, EnhanceParam<TShape[keyof TShape]>][];
}

type EnhanceParams<TShape> = {
	[K in keyof TShape]: EnhanceParam<TShape[K]>;
};

export type EnhanceParam<TValue> = TValue & {
	/** Replace the value of this query param */
	set(value: TValue): void;
	/**
	 * A shorthand function allowing you to update the query param
	 * when an input value changes (i.e., the `oninput` event)
	 */
	oninput: FormEventHandler<EventTarget>;
};
