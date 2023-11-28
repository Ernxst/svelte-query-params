import { parse } from "valibot";
import type {
	QuerySchema,
	Serializer,
	Validator,
	inferShape,
} from "./types.ts";

function parseValue(schema: Validator, value: string | undefined) {
	if (typeof schema === "function") {
		return schema(value);
	} else if ("parse" in schema) {
		return schema.parse(value);
	} else if ("async" in schema) {
		return parse(schema, value);
	}

	return value;
}

export function parseQueryParams<TSchema extends QuerySchema>(
	params: Record<string, string | undefined>,
	schemas: TSchema
): inferShape<TSchema> {
	const clone = {} as inferShape<TSchema>;
	const keys = new Set([...Object.keys(params), ...Object.keys(schemas)]);

	/**
	 * I think this might be the most hideous hack I've implemented yet.
	 *
	 * The issue is when validation fails, for some reason unknown to me, Svelte stops
	 * reacting to the updates (it still calls the parser again, but the consumer
	 * visible state does not change)
	 *
	 * I noticed this and added logs (below) and noticed it started working. Removing
	 * the logs breaks it again. Not even a raw expression fixes it.
	 *
	 * So, we just make console.log a noop and then put it back so it isn't
	 * logged to the console
	 *
	 * Maybe someone else can fix this
	 */
	const log = console.log;
	console.log = () => {};
	console.log({ params });
	console.log = log;

	for (const key of keys) {
		const value = params[key];

		clone[key as keyof TSchema] =
			key in schemas
				? parseValue(schemas[key], value)
				: /** Value wasn't defined in the schema, pass through as-is */
				  value;
	}

	return clone;
}

export function createDefaultSerializer(): Serializer {
	return (value) => (typeof value === "string" ? value : JSON.stringify(value));
}

export function entriesToRecord(entries: [string, string][]) {
	return entries.reduce<Record<string, string>>((acc, [key, value]) => {
		acc[key] = value;
		return acc;
	}, {});
}

export function mapValues<TKeys extends string, TValues, TReturn>(
	object: Record<TKeys, TValues>,
	mapFn: (value: TValues) => TReturn
) {
	return Object.fromEntries(
		Object.entries(object).map(([key, value]) => [key, mapFn(value as TValues)])
	);
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export function debounce<TFn extends (...args: any[]) => any>(
	func: TFn,
	delay: number
) {
	if (delay === 0) return func;

	let timeoutId: ReturnType<typeof setTimeout>;

	return function (...args: Parameters<TFn>) {
		clearTimeout(timeoutId);

		timeoutId = setTimeout(() => {
			func(...args);
		}, delay);
	};
}
