import { parse } from "valibot";
import type {
	QuerySchema,
	ValibotValidator,
	Validator,
	ValueValidator,
	ZodValidator,
	inferShape,
} from "./types.ts";

export function parseSearchString(search: string) {
	const params = new URLSearchParams(search);
	return Object.fromEntries(params.entries());
}

export function objectToQueryString(init: Record<string, string>) {
	return `?${new URLSearchParams(init)}`;
}

function parseObject(
	schemas: Record<string, ValueValidator>,
	input: Record<string, string>
): any {
	return Object.fromEntries(
		Object.entries(schemas).map(([key, schema]) => [
			key,
			parseValue(key, schema, input[key]),
		])
	);
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
	params: Record<string, string>,
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

export function diff(obj1: Record<string, any>, obj2: Record<string, any>) {
	const keys1 = Object.keys(obj1);
	const keys2 = Object.keys(obj2);

	if (keys1.length !== keys2.length) {
		return true;
	}

	for (const key of keys1) {
		if (obj1[key] !== obj2[key]) {
			return true;
		}
	}

	return false;
}
