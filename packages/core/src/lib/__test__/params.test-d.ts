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

				const [params, helpers] = useQueryParams(window.location);

				expectTypeOf(params.id).toEqualTypeOf<number>();
				expectTypeOf(params.q).toEqualTypeOf<string | undefined>();
				expectTypeOf(params).toEqualTypeOf<{
					id: number;
					q: string | undefined;
				}>();
				expectTypeOf(helpers.keys()).toEqualTypeOf<("q" | "id")[]>();
				expectTypeOf(helpers.entries()).toEqualTypeOf<
					["q" | "id", string | number | undefined][]
				>();

				expectTypeOf(helpers.set).toBeCallableWith({ id: 1, q: undefined });
				expectTypeOf(helpers.set).toBeCallableWith({ id: 1, q: "string" });
				expectTypeOf(helpers.update).toBeCallableWith({ id: 1, q: "string" });
				expectTypeOf(helpers.update).toBeCallableWith({ id: 1, q: undefined });
				expectTypeOf(helpers.update).toBeCallableWith({ q: "string" });
				expectTypeOf(helpers.update).toBeCallableWith({ q: undefined });
				expectTypeOf(helpers.remove).toBeCallableWith("id", "q");
			});
		});
	}
});
