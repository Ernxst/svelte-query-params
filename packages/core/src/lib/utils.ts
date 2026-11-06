import type { StandardSchemaV1 } from "@standard-schema/spec";
import type {
	Query,
	QuerySchema,
	QueryValue,
	SchemaValidator,
	ValueValidator,
	inferShape,
} from "./types.ts";

export class SchemaValidationError extends Error {
	readonly issues: ReadonlyArray<StandardSchemaV1.Issue>;

	constructor(issues: ReadonlyArray<StandardSchemaV1.Issue>) {
		super(issues.map((issue) => issue.message).join("\n"));
		this.name = "SchemaValidationError";
		this.issues = issues;
	}
}

function isSchema(obj: unknown): obj is SchemaValidator {
	return (
		(typeof obj === "object" || typeof obj === "function") &&
		obj !== null &&
		"~standard" in obj &&
		typeof (obj["~standard"] as any)?.validate === "function"
	);
}

function validate(schema: SchemaValidator, value: unknown) {
	const result = schema["~standard"].validate(value);
	if (result instanceof Promise) {
		throw new TypeError(
			"Async schemas are not supported: query params are validated synchronously"
		);
	}
	if (result.issues) throw new SchemaValidationError(result.issues);
	return result.value;
}

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
	if (isSchema(schema)) return validate(schema, value);
	if (typeof schema === "function") return schema(value);

	const name = (schema as any).constructor.name;
	throw new Error(
		`Unknown validator type (${name}) for param "${key}" (value: ${value})`
	);
}

export function parseQueryParams<TSchema extends QuerySchema>(
	params: Query,
	schemas: TSchema
): inferShape<TSchema> {
	if (isSchema(schemas)) return validate(schemas, params);
	if (typeof schemas === "function") return schemas(params);

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
