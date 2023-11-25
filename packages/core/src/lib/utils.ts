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

export function mapValues<TObj extends Record<string, any>, TReturn>(
	object: TObj,
	mapFn: (value: TObj[keyof TObj]) => TReturn
) {
	return Object.fromEntries(
		Object.entries(object).map(([key, value]) => [key, mapFn(value)])
	);
}

export function debounce(func: (...args: any[]) => any, delay: number) {
	let timeoutId: ReturnType<typeof setTimeout>;

	return function (...args: any[]) {
		clearTimeout(timeoutId);

		timeoutId = setTimeout(() => {
			func(...args);
		}, delay);
	};
}
