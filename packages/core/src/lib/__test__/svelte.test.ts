import { render, screen } from "@testing-library/svelte/svelte5";
import userEvent from "@testing-library/user-event";
import { tick } from "svelte";
import { beforeEach, describe, expect, test } from "vitest";
import { z } from "zod";
import { createUseQueryParams } from "../create-params.svelte.ts";
import type { UseQueryHook } from "../types";
import Button from "./fixtures/Button.svelte";
import FullUpdate from "./fixtures/FullUpdate.svelte";
import Input from "./fixtures/Input.svelte";
import PartialUpdate from "./fixtures/PartialUpdate.svelte";

describe("createUseQueryParams", () => {
	const user = userEvent.setup();
	const replaceState = history.replaceState.bind(history);

	beforeEach(() => {
		// reset window location for each test
		replaceState({}, "", "?");
	});

	describe("when a value is bound to an input", () => {
		const useQueryParams = createUseQueryParams({
			count: z.coerce.number().optional().default(0),
		});

		beforeEach(() => {
			render(Input, { useQueryParams });
		});

		test("should update browser params when input is changed", async () => {
			const [params, helpers] = useQueryParams(window.location);
			const input = screen.getByRole("spinbutton");

			await user.type(input, "123");

			expect(window.location.search).toEqual("?count=123");
			expect(params.count).toEqual(123);
			expect(helpers.entries()).toEqual([["count", 123]]);

			expect(params).toEqual({ count: 123 });
			expect(helpers.raw).toEqual({ count: "123" });
			expect(helpers.search).toEqual("?count=123");
		});

		test("should update input when search params updated externally", async () => {
			const [params, helpers] = useQueryParams(window.location);
			const input = screen.getByRole("spinbutton");

			window.history.replaceState({}, "", "?count=123");

			await tick();

			expect(input).toHaveValue(123);
			expect(params.count).toEqual(123);
			expect(helpers.entries()).toEqual([["count", 123]]);

			expect(params).toEqual({ count: 123 });
			expect(helpers.raw).toEqual({ count: "123" });
			expect(helpers.search).toEqual("?count=123");
		});

		test("should maintain url hash", async () => {
			window.location.hash = "#hello-world";
			const input = screen.getByRole("spinbutton");

			await user.type(input, "123");

			expect(window.location.href).toMatch("?count=123#hello-world");
			expect(window.location.search).toEqual("?count=123");
			expect(window.location.hash).toEqual("#hello-world");
		});
	});

	describe("when updating params on assignment", () => {
		let useQueryParams: UseQueryHook<{ count: number }>;

		beforeEach(() => {
			useQueryParams = createUseQueryParams({
				count: z.coerce.number().optional().default(0),
			});

			render(Button, { useQueryParams });
		});

		test("should update params and browser params", async () => {
			const [params, helpers] = useQueryParams(window.location);
			const button = screen.getByRole("button");

			await user.click(button);

			expect(button).toHaveTextContent("count is 1");
			expect(window.location.search).toEqual("?count=1");
			expect(params.count).toEqual(1);
			expect(helpers.entries()).toEqual([["count", 1]]);

			expect(params).toEqual({ count: 1 });
			expect(helpers.raw).toEqual({ count: "1" });
			expect(helpers.search).toEqual("?count=1");
		});
	});

	describe("when bulk updating params", () => {
		let useQueryParams: UseQueryHook<{ count: number; id: number }>;

		beforeEach(() => {
			useQueryParams = createUseQueryParams({
				count: z.coerce.number().optional().default(0),
				id: z.coerce.number().optional().default(0),
			});
		});

		test("should apply full updates", async () => {
			render(FullUpdate, { useQueryParams });

			const [params, helpers] = useQueryParams(window.location);
			const [countInput, idInput] = screen.getAllByRole("spinbutton");
			const button = screen.getByRole("button");

			await user.click(button);

			expect(window.location.search).toEqual("?count=1&id=1");
			expect(countInput).toHaveValue(1);
			expect(idInput).toHaveValue(1);

			expect(params.count).toEqual(1);
			expect(params.id).toEqual(1);
			expect(helpers.entries()).toEqual([
				["count", 1],
				["id", 1],
			]);

			expect(params).toEqual({ count: 1, id: 1 });
			expect(helpers.raw).toEqual({ count: "1", id: "1" });
			expect(helpers.search).toEqual("?count=1&id=1");
		});

		test("should apply partial updates", async () => {
			render(PartialUpdate, { useQueryParams });

			const [params, helpers] = useQueryParams(window.location);
			const [countInput, idInput] = screen.getAllByRole("spinbutton");
			const button = screen.getByRole("button");

			await user.click(button);

			expect(window.location.search).toEqual("?count=1");
			expect(countInput).toHaveValue(1);
			expect(idInput).toHaveValue(0);

			expect(params.count).toEqual(1);
			expect(params.id).toEqual(0);
			expect(helpers.entries()).toEqual([
				["count", 1],
				["id", 0],
			]);

			expect(params).toEqual({ count: 1, id: 0 });
			expect(helpers.raw).toEqual({ count: "1" });
			expect(helpers.search).toEqual("?count=1");
		});
	});

	describe("with query params not defined in the schema", () => {
		let useQueryParams: UseQueryHook<{ count: number }>;

		beforeEach(() => {
			replaceState({}, "", "?name=johndoe");

			useQueryParams = createUseQueryParams({
				count: z.coerce.number().optional().default(0),
			});

			render(Input, { useQueryParams });
		});

		test("should maintain unknown query params", async () => {
			const [params, helpers] = useQueryParams(window.location);
			const input = screen.getByRole("spinbutton");

			await user.type(input, "123");

			expect(window.location.search).toEqual("?name=johndoe&count=123");
			expect(params.count).toEqual(123);
			expect(helpers.entries()).toEqual([["count", 123]]);

			expect(params).toEqual({ count: 123 });
			expect(helpers.raw).toEqual({ count: "123", name: "johndoe" });
			expect(helpers.search).toEqual("?name=johndoe&count=123");
		});
	});
});
