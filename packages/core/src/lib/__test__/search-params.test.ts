import { ReactiveSearchParams } from "$lib/search-params";
import { describe, expect, test } from "vitest";

describe("ReactiveSearchParams", () => {
	describe("raw", () => {
		test("should return key-value pairs as an object", () => {
			const params = new ReactiveSearchParams({ id: "1", name: "john" });
			params.set("sort", "asc");

			expect(params.raw).toEqual({ id: "1", name: "john", sort: "asc" });
		});

		test("should return multi-value params as an array", () => {
			const params = new ReactiveSearchParams({ id: "1", name: "john" });
			params.set("filters", ["a", "b", "c", "d"]);

			expect(params.raw).toEqual({
				id: "1",
				name: "john",
				filters: ["a", "b", "c", "d"],
			});
		});

		test("should return updated object when params changed", () => {
			const params = new ReactiveSearchParams({ id: "1", name: "john" });
			params.set("sort", "asc");
			expect(params.raw).toEqual({ id: "1", name: "john", sort: "asc" });

			params.set("name", "jane");
			expect(params.raw).toEqual({ id: "1", name: "jane", sort: "asc" });
		});
	});

	describe("uniqueKeys", () => {
		test("should return keys", () => {
			const params = new ReactiveSearchParams({ id: "1", sort: "asc" });

			expect(params.uniqueKeys).toEqual(["id", "sort"]);
		});

		test("should return unique keys for multi-value params", () => {
			const params = new ReactiveSearchParams({ id: "1", sort: "asc" });
			params.set("sort", ["asc", "desc"]);

			expect(params.uniqueKeys).toEqual(["id", "sort"]);
		});

		test("should return updated keys when params changed", () => {
			const params = new ReactiveSearchParams({ id: "1", sort: "asc" });
			expect(params.uniqueKeys).toEqual(["id", "sort"]);

			params.set("foo", "bar");
			expect(params.uniqueKeys).toEqual(["id", "sort", "foo"]);
		});
	});

	describe("search", () => {
		test("should stringify search params", () => {
			const params = new ReactiveSearchParams({ id: "1", sort: "asc" });

			expect(params.search).toEqual("?id=1&sort=asc");
		});

		test("should stringify multi-value search params", () => {
			const params = new ReactiveSearchParams({ id: "1" });
			params.set("sort", ["asc", "desc"]);

			expect(params.search).toEqual("?id=1&sort=asc&sort=desc");
		});

		test("should return empty string when there are no params", () => {
			const params = new ReactiveSearchParams();

			expect(params.search).toEqual("");
		});

		test("should return updated string when params changed", () => {
			const params = new ReactiveSearchParams({ id: "1", sort: "asc" });
			expect(params.search).toEqual("?id=1&sort=asc");

			params.set("sort", "desc");
			expect(params.search).toEqual("?id=1&sort=desc");
		});
	});

	describe("clear", () => {
		test("should clear keys", () => {
			const params = new ReactiveSearchParams({ id: "1" });
			expect([...params.keys()]).toEqual(["id"]);

			params.clear();
			expect([...params.keys()]).toHaveLength(0);
		});
	});

	describe("set", () => {
		test("should set string-value params", () => {
			const params = new ReactiveSearchParams({ id: "1" });
			expect(params.search).toEqual("?id=1");
			expect(params.get("id")).toEqual("1");
			expect(params.getAll("id")).toEqual(["1"]);

			params.set("id", "2");

			expect(params.search).toEqual("?id=2");
			expect(params.get("id")).toEqual("2");
			expect(params.getAll("id")).toEqual(["2"]);
		});

		test("should handle multi-value params", () => {
			const params = new ReactiveSearchParams({ id: "1" });
			expect(params.search).toEqual("?id=1");
			expect(params.get("id")).toEqual("1");
			expect(params.getAll("id")).toEqual(["1"]);

			params.set("id", ["2", "3"]);

			expect(params.search).toEqual("?id=2&id=3");
			expect(params.get("id")).toEqual("2");
			expect(params.getAll("id")).toEqual(["2", "3"]);
		});
	});

	describe("setFromObject", () => {
		test("should set query params from an object", () => {
			const params = new ReactiveSearchParams({ id: "1" });

			params.setFromObject({ id: "3", name: "john" });

			expect(params.search).toEqual("?id=3&name=john");
			expect(params.get("id")).toEqual("3");
			expect(params.getAll("id")).toEqual(["3"]);
			expect(params.get("name")).toEqual("john");
			expect(params.getAll("name")).toEqual(["john"]);
		});
	});

	describe("setFromSearch", () => {
		test("should set query params from search string", () => {
			const params = new ReactiveSearchParams({ id: "1" });

			expect(params.search).toEqual("?id=1");
			expect(params.get("id")).toEqual("1");
			expect(params.getAll("id")).toEqual(["1"]);
		});

		test("should overwrite query params", () => {
			const params = new ReactiveSearchParams({ id: "1" });
			expect(params.search).toEqual("?id=1");
			expect(params.get("id")).toEqual("1");
			expect(params.getAll("id")).toEqual(["1"]);

			params.setFromSearch("?id=2");

			expect(params.search).toEqual("?id=2");
			expect(params.get("id")).toEqual("2");
			expect(params.getAll("id")).toEqual(["2"]);
		});

		test("should handle multi-value params", () => {
			const params = new ReactiveSearchParams();
			params.setFromSearch("?id=2&id=3");

			expect(params.search).toEqual("?id=2&id=3");
			expect(params.get("id")).toEqual("2");
			expect(params.getAll("id")).toEqual(["2", "3"]);
		});
	});

	describe("changed", () => {
		test("should return false when string values are the same", () => {
			const params = new ReactiveSearchParams({ id: "1" });

			expect(params.changed("id", "1")).toBeFalsy();
		});

		test("should return false when arrays have the same values", () => {
			const params = new ReactiveSearchParams();
			params.set("names", ["john", "jane"]);

			expect(params.changed("names", ["john", "jane"])).toBeFalsy();
		});

		test("should return false when arrays have the same values in any order", () => {
			const params = new ReactiveSearchParams();
			params.set("names", ["john", "jane"]);

			expect(params.changed("names", ["jane", "john"])).toBeFalsy();
		});

		test("should return true when string values are not the same", () => {
			const params = new ReactiveSearchParams({ id: "1" });

			expect(params.changed("id", "2")).toBeTruthy();
		});

		test("should return true when arrays do not have the same values", () => {
			const params = new ReactiveSearchParams();
			params.set("names", ["john", "jane", "james"]);

			expect(params.changed("names", ["jane", "john"])).toBeTruthy();
		});
	});

	describe("equals", () => {
		test("should return true when object contains same properties", () => {
			const params = new ReactiveSearchParams({ id: "2" });
			expect(params.equals({ id: "2" })).toBeTruthy();
		});

		test("should return true when no params", () => {
			const params = new ReactiveSearchParams();
			expect(params.equals({})).toBeTruthy();
		});

		test("should handle multi-value params", () => {
			const params = new ReactiveSearchParams({ id: "2" });
			params.set("names", ["john", "jane"]);

			expect(params.equals({ id: "2", names: ["john", "jane"] })).toBeTruthy();
		});

		test("should handle multi-value params in any order", () => {
			const params = new ReactiveSearchParams({ id: "2" });
			params.set("names", ["john", "jane"]);

			expect(params.equals({ id: "2", names: ["jane", "john"] })).toBeTruthy();
		});

		test("should return false when object has different keys", () => {
			const params = new ReactiveSearchParams({ id: "2" });
			expect(params.equals({ foo: "bar" })).toBeFalsy();
		});

		test("should return false when object has different value", () => {
			const params = new ReactiveSearchParams({ id: "2" });
			expect(params.equals({ id: "3" })).toBeFalsy();
		});

		test("should return false when object has different number of keys", () => {
			const params = new ReactiveSearchParams({ id: "2" });
			expect(params.equals({ id: "2", foo: "bar" })).toBeFalsy();
		});

		test("should return false multi-value params are different", () => {
			const params = new ReactiveSearchParams();
			params.set("names", ["john", "jane"]);

			expect(params.equals({ names: ["jane", "john", "james"] })).toBeFalsy();
		});
	});
});
