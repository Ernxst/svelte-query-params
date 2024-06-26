import { parseQueryParams } from "$lib/utils";
import * as v from "valibot";
import { describe, expect, test } from "vitest";
import { z } from "zod";

describe("parseQueryParams", () => {
	test("should throw error for unknown validator type", () => {
		expect(() => {
			// @ts-expect-error
			parseQueryParams({ value: "123" }, { value: new Error() });
		}).toThrowError(
			'Unknown validator type (Error) for param "value" (value: 123)'
		);
	});

	test.each([
		{
			type: "zod",
			schema: z.object({
				id: z.coerce.number().int(),
				name: z.string(),
				email: z.string().email(),
			}),
		},
		{
			type: "valibot",
			schema: v.object({
				id: v.pipe(v.string(), v.transform(Number), v.integer()),
				name: v.string(),
				email: v.pipe(v.string(), v.email()),
			}),
		},
		{
			type: "function",
			schema: ({ id, name, email }: any) => {
				return { id: Number.parseInt(id), name, email };
			},
		},
		{
			type: "record of zod",
			schema: {
				id: z.coerce.number().int(),
				name: z.string(),
				email: z.string().email(),
			},
		},
		{
			type: "record of valibot",
			schema: {
				id: v.pipe(v.string(), v.transform(Number), v.integer()),
				name: v.string(),
				email: v.pipe(v.string(), v.email()),
			},
		},
		{
			type: "record of function",
			schema: {
				id: (id: any) => Number.parseInt(id),
				name: (name: any) => name,
				email: (email: any) => email,
			},
		},
	])("should parse input with a $type validator", ({ schema }) => {
		const parsed = parseQueryParams(
			{
				id: "123",
				name: "John Doe",
				email: "john.doe@mail.co.uk",
				noPassthrough: "some-value",
			},
			schema
		);

		expect(parsed).toEqual({
			id: 123,
			name: "John Doe",
			email: "john.doe@mail.co.uk",
		});
	});
});
