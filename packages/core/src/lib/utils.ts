import { parse } from "valibot";
import type {
	Query,
	QuerySchema,
	QueryValue,
	ValibotValidator,
	ValueValidator,
	ZodValidator,
	inferShape,
} from "./types.ts";

function parseObject(
	schemas: Record<string, ValueValidator>,
	input: Query
): any {
	return Object.fromEntries(
		Object.entries(schemas).map(([key, schema]) => [
			key,
			parseValue(key, schema, input[key]),
		])
	);
}

function parseValue(key: string, schema: ValueValidator, value?: QueryValue) {
	if (typeof schema === "function") return schema(value);
	if (isZodSchema(schema)) return schema.parse(value);
	if (isValibotSchema(schema)) return parse(schema, value);

	const name = (schema as any).constructor.name;
	throw new Error(
		`Unknown validator type (${name}) for param "${key}" (value: ${value})`
	);
}

function isZodSchema(obj: QuerySchema): obj is ZodValidator {
	return (
		typeof obj === "object" &&
		obj &&
		"parse" in obj &&
		"safeParse" in obj &&
		typeof obj.parse === "function" &&
		typeof obj.safeParse === "function"
	);
}

function isValibotSchema(obj: QuerySchema): obj is ValibotValidator {
	return (
		typeof obj === "object" &&
		obj &&
		"async" in obj &&
		"kind" in obj &&
		"_run" in obj &&
		obj.kind === "schema" &&
		typeof obj.async === "boolean" &&
		typeof obj._run === "function"
	);
}

export function parseQueryParams<TSchema extends QuerySchema>(
	params: Query,
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
