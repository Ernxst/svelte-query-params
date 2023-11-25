import { render, screen } from "@testing-library/svelte";
import { tick } from "svelte";
import { beforeEach, describe, expect, test } from "vitest";
import userEvent from "@testing-library/user-event";
import { z } from "zod";
import { createUseQueryParams } from "../create-params.svelte.ts";
import Input from "./fixtures/Input.svelte";
import PartialUpdate from "./fixtures/PartialUpdate.svelte";
import FullUpdate from "./fixtures/FullUpdate.svelte";
import Button from "./fixtures/Button.svelte";

describe("createUseQueryParams", () => {
	const user = userEvent.setup();

	describe("when a value is bound to an input", () => {
		const useQueryParams = createUseQueryParams({
			count: z.coerce.number().optional().default(0),
		});

		const params = useQueryParams();

		beforeEach(() => {
			render(Input, { useQueryParams });
			params.count = 0;
		});

		test("should update browser params when input is changed", async () => {
			const input = screen.getByRole("spinbutton");

			await user.type(input, "123");
			await tick();

			expect(window.location.search).toEqual(`?count=123`);
			expect(params.count).toEqual(123);
			expect(params.entries()).toEqual([["count", 123]]);

			// expect(params.query).toEqual({ count: 123 });
			// expect(params.raw).toEqual({ count: "123" });
			// expect(params.search).toEqual(`?count=123`);
		});

		test("should update input when search params updated externally", async () => {
			const input = screen.getByRole("spinbutton");

			window.history.replaceState({}, "", "?count=123");

			await tick();

			expect(input).toHaveValue(123);
			expect(params.count).toEqual(123);
			expect(params.entries()).toEqual([["count", 123]]);

			// expect(params.query).toEqual({ count: 123 });
			// expect(params.raw).toEqual({ count: "123" });
			// expect(params.search).toEqual(`?count=123`);
		});
	});

	describe("when updating params on assignment", () => {
		const useQueryParams = createUseQueryParams({
			count: z.coerce.number().optional().default(0),
		});

		const params = useQueryParams();

		beforeEach(() => {
			render(Button, { useQueryParams });
			params.count = 0;
		});

		test("should update params and browser params", async () => {
			const button = screen.getByRole("button");

			await user.click(button);
			await tick();

			expect(button).toHaveTextContent("count is 1");
			expect(window.location.search).toEqual(`?count=1`);
			expect(params.count).toEqual(1);
			expect(params.entries()).toEqual([["count", 1]]);

			// expect(params.query).toEqual({ count: 2 });
			// expect(params.raw).toEqual({ count: "2" });
			// expect(params.search).toEqual(`?count=2`);
		});
	});

	describe("when bulk updating params", () => {
		const useQueryParams = createUseQueryParams({
			count: z.coerce.number().optional().default(0),
			id: z.coerce.number().optional().default(0),
		});

		const params = useQueryParams();

		beforeEach(() => {
			params.count = 0;
			params.id = 0;
		})

		test("should apply full updates", async () => {
			render(FullUpdate, { useQueryParams });

			const [countInput, idInput] = screen.getAllByRole("textbox");
			const button = screen.getByRole("button");

			await user.click(button);
			await tick();

			expect(window.location.search).toEqual(`?count=1&id=1`);
			expect(countInput).toHaveValue("1");
			expect(idInput).toHaveValue("1");

			expect(params.count).toEqual(1);
			expect(params.id).toEqual(1);
			expect(params.entries()).toEqual([
				["count", 1],
				["id", 1],
			]);

			// expect(params.query).toEqual({ count: 1, id: 1 });
			// expect(params.raw).toEqual({ count: "1", id: "1" });
			// expect(params.search).toEqual(`?count=1&id=1`);
		});

		test("should apply partial updates", async () => {
			render(PartialUpdate, { useQueryParams });

			const [countInput, idInput] = screen.getAllByRole("textbox");
			const button = screen.getByRole("button");

			await user.click(button);
			await tick();

			expect(window.location.search).toEqual(`?count=1&id=0`);
			expect(countInput).toHaveValue("1");
			expect(idInput).toHaveValue("0");

			expect(params.count).toEqual(1);
			expect(params.id).toEqual(0);
			expect(params.entries()).toEqual([
				["count", 1],
				["id", 0],
			]);

			// expect(params.query).toEqual({ count: 1, id: 0 });
			// expect(params.raw).toEqual({ count: "1", id: "0" });
			// expect(params.search).toEqual(`?count=1&id=0`);
		});
	});
});