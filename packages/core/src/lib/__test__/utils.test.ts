import { debounce, mapValues, parseQueryParams } from "$lib/utils";
import * as v from "valibot";
import { assert, beforeEach, describe, expect, test, vi } from "vitest";
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

describe("mapValues", () => {
	test("should call mapper for every value", () => {
		const mock = vi.fn().mockReturnValue("foo");

		const result = mapValues(
			{
				id: "123",
				name: "john.doe",
				email: "john.doe@mail.co.uk",
			},
			mock
		);

		expect(result).toEqual({ id: "foo", name: "foo", email: "foo" });
		expect(mock).toHaveBeenCalledTimes(3);
		expect(mock).toHaveBeenCalledWith("123");
		expect(mock).toHaveBeenCalledWith("john.doe");
		expect(mock).toHaveBeenCalledWith("john.doe@mail.co.uk");
	});
});

describe("debounce", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	test("should debounce a function", () => {
		const fn = vi.fn().mockImplementation((i) => i);
		const debounced = debounce(fn, 32);

		const results = [debounced("a"), debounced("b"), debounced("c")];
		expect(results).toEqual([undefined, undefined, undefined]);
		expect(fn).not.toHaveBeenCalled();

		setTimeout(() => {
			expect(fn).toHaveBeenCalledOnce();

			const results = [debounced("d"), debounced("e"), debounced("f")];
			expect(results).toEqual(["c", "c", "c"]);
			expect(fn).toHaveBeenCalledOnce();
		}, 128);

		setTimeout(() => {
			expect(fn).toHaveBeenCalledTimes(2);
		}, 256);
	});

	test("subsequent debounced calls return the last `func` result", () => {
		const fn = vi.fn().mockImplementation((i) => i);
		const debounced = debounce(fn, 32);
		debounced("a");
		expect(fn).not.toHaveBeenCalled();

		setTimeout(() => {
			assert.notStrictEqual(debounced("b"), "b");
			expect(fn).toHaveBeenCalledOnce();
		}, 64);

		setTimeout(() => {
			assert.notStrictEqual(debounced("c"), "c");
			expect(fn).toHaveBeenCalledTimes(2);
		}, 128);
	});

	test("should immediately call `func` when `delay` is `0`", () => {
		const fn = vi.fn().mockImplementation((i) => i);
		const debounced = debounce(fn, 0);

		debounced();
		debounced();

		expect(fn).toHaveBeenCalledTimes(2);
	});
});
