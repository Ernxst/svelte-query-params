import { parse } from "valibot";
import type {
	QuerySchema,
	ValibotValidator,
	Validator,
	ValueValidator,
	ZodValidator,
	inferShape,
} from "./types.ts";

export function fromURL({ search }: { search: string }) {
	const params = new URLSearchParams(search);
	return Object.fromEntries(params.entries());
}

function parseObject(schemas: Record<string, ValueValidator>, input: object) {
	const clone: any = {};
	const keys = new Set([...Object.keys(input), ...Object.keys(schemas)]);

	for (const key of keys) {
		const value = (input as any)[key];

		clone[key] =
			key in schemas && schemas[key]
				? parseValue(key, schemas[key], value)
				: /** Value wasn't defined in the schema, pass through as-is */
					value;
	}

	return clone;
}

function parseValue(
	key: string,
	schema: ValueValidator | Validator,
	value?: string
) {
	if (typeof schema === "function") return schema(value);
	if (isZodSchema(schema)) return schema.parse(value);
	if (isValibotSchema(schema)) return parse(schema, value);

	throw new Error(
		`Unknown schema type (${typeof schema}) for field: "${key}" (value: ${value})`
	);
}

function isZodSchema(obj: any): obj is ZodValidator {
	return typeof obj === "object" && obj && "parse" in obj && "safeParse" in obj;
}

function isValibotSchema(obj: any): obj is ValibotValidator {
	return typeof obj === "object" && obj && "async" in obj && "_parse" in obj;
}

export function parseQueryParams<TSchema extends QuerySchema>(
	params: Record<string, string | undefined>,
	schemas: TSchema
): inferShape<TSchema> {
	if (typeof schemas === "function") return schemas(params);
	if (isZodSchema(schemas)) return schemas.parse(params);
	if (isValibotSchema(schemas)) return parse(schemas, params);

	return parseObject(schemas, params);
}

export function mapValues<TKeys extends string, TValues, TReturn>(
	object: Record<TKeys, TValues>,
	mapFn: (value: TValues) => TReturn
) {
	return Object.fromEntries(
		Object.entries(object).map(([key, value]) => [key, mapFn(value as TValues)])
	);
}

export function debounce<TFn extends (...args: any[]) => any>(
	func: TFn,
	delay: number
) {
	if (delay === 0) return func;

	let timeoutId: ReturnType<typeof setTimeout>;

	return (...args: Parameters<TFn>) => {
		clearTimeout(timeoutId);

		timeoutId = setTimeout(() => {
			func(...args);
		}, delay);
	};
}
