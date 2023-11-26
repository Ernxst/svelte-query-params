import { number, optional, string } from "valibot";
import { describe, expectTypeOf, test } from "vitest";
import { z } from "zod";
import { createUseQueryParams } from "../create-params.svelte.ts";

describe("Type tests", () => {
	const items = [
		{
			name: "zod",
			schema: {
				id: z.number(),
				q: z.string().optional(),
			},
		},
		{
			name: "valibot",
			schema: {
				id: number(),
				q: optional(string()),
			},
		},
		{
			name: "function validators",
			schema: {
				id: (value: string | undefined) => Number(value),
				q: (value: string | undefined) => value,
			},
		},
		{
			name: "mixes and matched",
			schema: {
				id: z.number(),
				q: (value: string | undefined) => value,
			},
		},
	];

	for (const { name, schema } of items) {
		describe(name, () => {
			test("should infer correct types", () => {
				const useQueryParams = createUseQueryParams(schema);

				const params = useQueryParams();

				expectTypeOf(params.id).toEqualTypeOf<number>();
				expectTypeOf(params.q).toEqualTypeOf<string | undefined>();
				expectTypeOf(params.query).toEqualTypeOf<{
					id: number;
					q: string | undefined;
				}>();
				expectTypeOf(params.keys()).toEqualTypeOf<("q" | "id")[]>();
				expectTypeOf(params.entries()).toEqualTypeOf<
					["q" | "id", string | number | undefined][]
				>();

				expectTypeOf(params.set).toBeCallableWith({ id: 1, q: undefined });
				expectTypeOf(params.set).toBeCallableWith({ id: 1, q: "string" });
				expectTypeOf(params.update).toBeCallableWith({ id: 1, q: "string" });
				expectTypeOf(params.update).toBeCallableWith({ id: 1, q: undefined });
				expectTypeOf(params.update).toBeCallableWith({ q: "string" });
				expectTypeOf(params.update).toBeCallableWith({ q: undefined });
				expectTypeOf(params.remove).toBeCallableWith("id", "q");
			});
		});
	}
});
