import type { QuerySchema, Serializer, inferShape } from "./types";

export function parseQueryParams<TSchema extends QuerySchema>(
	params: Record<string, string | undefined>,
	schemas: TSchema
): inferShape<TSchema> {
	// TODO: If an error is thrown, it breaks reactivity for object side
	const clone = {} as inferShape<TSchema>;

	for (const [key, value] of Object.entries(params)) {
		if (key in schemas) {
			const schema = schemas[key];
			// TODO: @decs/typeschema isn't tree-shaking, ballooning bundle size, support zod only for now
			const parsed =
				typeof schema === "function" ? schema(value) : schema.parse(value);
			clone[key as keyof TSchema] = parsed;
		} else {
			/** Value wasn't defined in the schema, pass through as-is */
			clone[key as keyof TSchema] = value as any;
		}
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
