import type { BaseSchema, InferOutput } from "valibot";
import type { z } from "zod";
import type { Adapter } from "./adapters/types.ts";

export type FunctionValidator<TOut extends object = any> = (
	value: Query
) => TOut;
export type FunctionValueValidator<TOut = any> = (value?: QueryValue) => TOut;
export type ValibotValidator = BaseSchema<any, any, any>;
export type ZodValidator = z.ZodType;
export type ValueValidator =
	| FunctionValueValidator
	| ZodValidator
	| ValibotValidator;
export type Validator = FunctionValidator | ZodValidator | ValibotValidator;

export type inferFromValidator<TValidator extends Validator> =
	TValidator extends ZodValidator
		? z.infer<TValidator>
		: TValidator extends ValibotValidator
			? InferOutput<TValidator>
			: TValidator extends FunctionValidator
				? ReturnType<TValidator>
				: TValidator extends FunctionValueValidator
					? ReturnType<TValidator>
					: never;

export type QuerySchema = Validator | Record<string, ValueValidator>;

type Empty = Record<string, never>;
export type QueryValue = string | string[];
export type Query = Record<string, QueryValue>;

export type inferShape<TShape extends QuerySchema> = TShape extends Validator
	? inferFromValidator<TShape>
	: TShape extends Empty
		? Empty
		: TShape extends Record<string, Validator>
			? {
					[K in keyof TShape]: inferFromValidator<TShape[K]>;
				} & {}
			: never;

export type Serializer = (value: unknown) => string;
export type URLLike = Pick<URL, "search" | "hash">;
export type WindowLike = Pick<
	typeof window,
	"location" | "history" | "addEventListener" | "removeEventListener"
>;

export interface QueryParamsOptions {
	/**
	 * Provide a custom implementation of {@linkcode window}. It requires
	 * {@linkcode window.location}, {@linkcode window.history},
	 * {@linkcode window.addEventListener} and {@linkcode window.removeEventListener}
	 *
	 * @default window
	 */
	windowObj?: WindowLike;

	/**
	 * Add a delay (in ms) before updating the browser URL. This is useful in
	 * situations where URL updates happen frequently, e.g., on every keystroke.
	 *
	 * Note this does not affect the reactive query params object - this will
	 * always be updated immediately.
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

	/**
	 * Adapter to control URL peristence. Defaults to the `browser` adapter. You
	 * **must** pass the `sveltekit` adapter when using SvelteKit with SSR,
	 * otherwise your app may break!
	 */
	adapter?: Adapter;
}

export type QueryHelpers<TShape extends Record<string, unknown>> = {
	/**
	 * The raw query params, extracted from {@linkcode windowObj.location.href}
	 *
	 * Note: this may include query params not defined in your schema. Values will
	 * not have been parsed even if you have specified so in your validators.
	 *
	 * Also note that if you've defined an optional property in your validators
	 * with a default value, it will `undefined` here - without applying the
	 * default - if the value isn't set in the URL. It will, however, be
	 * available (with the default) in {@linkcode QueryHelpers.all}
	 */
	readonly raw: Query;
	/**
	 * Similar to {@linkcode raw}, but any params specified in your validators
	 * will have been parsed - all other values are passed through as-is.
	 *
	 * Note: this may include query params not defined in your schema.
	 */
	readonly all: Query & TShape;
	/**
	 * The query string, generated from the {@linkcode QueryHelpers.raw} query
	 * which may contain query params not defined in your schema.
	 *
	 * If there are query params, this will always start with `?`; if there
	 * are no query params, this will be the empty string.
	 */
	readonly search: string;
	/** Replace _ALL_ query params, triggering a reactive and browser update */
	set(params: TShape): void;
	/** Update a subset of the query params, triggering a reactive and browser update */
	update(params: Partial<TShape>): void;
	/** Remove query params. Note that this may cause your validation check to fail */
	remove(...params: (keyof TShape)[]): void;
	/** Manually unset unregister all event listeners */
	unsubscribe(): void;
	/**
	 * Return the parsed query keys. This only includes the keys from your
	 * validators. Unlike {@linkcode Object.keys}, this is type-safe.
	 */
	keys(): Array<keyof TShape>;
	/**
	 * Type-safe version of {@linkcode Object.entries}. Like
	 * {@linkcode QueryHelpers.keys}, this only contains entries from from your
	 * validators.
	 */
	entries(): Array<[keyof TShape, TShape[keyof TShape]]>;
};

export type QueryHook<TShape extends Record<string, unknown>> = [
	TShape,
	QueryHelpers<TShape>,
];

export type UseQueryHook<TShape extends Record<string, unknown>> =
	/**
	 * @param url The current URL
	 */
	(url: URLLike) => QueryHook<TShape>;
