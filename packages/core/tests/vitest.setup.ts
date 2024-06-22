import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/svelte/svelte5";
import { afterEach } from "vitest";

afterEach(() => {
	cleanup();
});
