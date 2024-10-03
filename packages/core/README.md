# Svelte Query Params

The easiest way to reactively manage query params in Svelte _and_ SvelteKit applications, both on the server and in the browser. Built for Svelte 5 and integrates with existing validation libraries to parse, coerce and transform query params into the data your application needs.

## Installation

[`svelte^5`](https://svelte-5-preview.vercel.app/docs/introduction) is required:

```bash
npm install svelte-query-params svelte@next
```

```bash
pnpm install svelte-query-params svelte@next
```

```bash
yarn add svelte-query-params svelte@next
```

```bash
bun install svelte-query-params svelte@next
```

`svelte` requires a version of `5.0.0-next.169` or newer as it [renamed a public API](https://github.com/sveltejs/svelte/releases/tag/svelte%405.0.0-next.169) that this library uses.

By default, `svelte-query-params` uses [`URLSearchParams`](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams) to handle interpreting the location string, which means it does not decode `null` and has limited handling of other more advanced URL parameter configurations. If you want access to those features, add a third-party library like query-string and tell [svelte-query-params to use it](#options).

## Features

- **Reactivity**: The library providies a reactive object that reflects the current state of query parameters.

- **Browser and Server Support**: The utility is designed to work seamlessly in both browser and server environments.

- **Customizable Validators**: Define validators for each query parameter to ensure proper data types and constraints.

- **Debounced Updates**: Optionally debounce updates to query parameters to optimize performance.

- **Event Handling**: Automatically handles `popstate` events for accurate synchronisation with browser history.

- **Serialisation**: Control how query params are serialised into strings to the browser

- **Multi-value params**: Supports multi-value query parameters with ease

## Usage

In some lib file e.g., `src/lib/params.ts`:

```javascript
import { createUseQueryParams } from "svelte-query-params";

// Define validators for query parameters
const validators = {
  page: (value) => typeof value === "number" && value > 0,
  q: (value) => typeof value === "string",
};

// Create the hook
export const useQueryParams = createUseQueryParams(validators);
```

`createUseQueryParams` returns a hook, rather than the reactive object itself, as the reactive nature may be lost when exporting and importing these files.

Then you can use this hook in your Svelte components:

```svelte
<script>
  import { useQueryParams } from "$lib/params"; // Import assuming SvelteKit
  import { page } from "$app/stores";

  const [params, helpers] = useQueryParams($page.url); // You must pass the URL

  // Access query parameters
  console.log(params.page); // Current 'page' value
  console.log(params.q); // Current 'q' value

  // Set query parameters
  params.page = 1;
  params.q = "example";

  // Raw query params from the browser, all as strings
  helpers.raw;

  // All query params, including those that were not set in schema
  helpers.all;

  // Readonly search string, with the ? prefix
  helpers.search;

  // Update all query parameters in bulk
  helpers.update({ page: 2, q: 'shoes' });

  // Apply partial updates to query params
  helpers.update({ page: 3 });

  // Remove query parameters
  helpers.remove("q");

  // Unsubscribe from popstate events
  helpers.unsubscribe();

  // Access query keys
  helpers.keys();

  // Access entries:
  helpers.entries();
</script>

<p>
  Currently on page {params.page}, searching for {params.q}
</p>

<!-- Bind the 'q' query param to the input -->
<input name="search" bind:value={params.q}>
```

## Validators

`svelte-query-params` supports [`zod`](https://github.com/colinhacks/zod), [`valibot`](https://github.com/colinhacks/zod) and function validators to define the schema for query params. Therefore, you do not need to learn an extra API for validating data.

When using `zod` or `valibot`, you do not need to wrap your schema
in zod `z.object({ ... })` or valibot `object`:

```javascript
import { z } from "zod";
import { createUseQueryParams } from "svelte-query-params";

const useQueryParams = createUseQueryParams({
  page: z.number(),
  q: z.string()
});
```

But you can if you want.

Note that it is possible to mix and match the schemas if needed:

```javascript
import { z } from "zod";
import { string } from "valibot";
import { createUseQueryParams } from "svelte-query-params";

const useQueryParams = createUseQueryParams({
  page: (value) => typeof value === "number" && value > 0,
  sort: string(),
  q: z.string()
});
```

### Array Values

With a function validator, you may receive the param as either a string, an array of strings, or undefined. As a result, you must handle all three cases to support multi-value params:

```javascript
const validators = {
  categories: (value) => {
    if (!value) return []
    return Array.isArray(value) ? value : [value]
  }
}
```

With Zod, you need to handle the case where there's either 0 or 1 query param value as this library will not infer this as an array beforehand. You must define your array parameter like:

```javascript
import { z } from "zod";

z.object({
	categories: z
		.union([z.string().array(), z.string()])
		.default([])
		.transform((c) => (Array.isArray(c) ? c : [c])),
})
```

The union between a string and array of strings handles 1 or more query params; a default is set to the empty array to allow the parameter to be omitted from the URL and it's transformed at the end to convert the single value param into an array.

In the same manner, with Valibot:

```javascript
import * as v from "valibot";

v.object({
	categories: v.pipe(
		v.optional(v.union([v.array(v.string()), v.string()]), []),
		v.transform((c) => (Array.isArray(c) ? c : [c]))
	),
});
```

## Options

`createUseQueryParams` takes an options object as the second argument, with the following properties:

| Option      | Default           | Description                                                                                                                                                                                                                           |
|-------------|-------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `windowObj` | `window`          | (Optional) Provide a custom implementation of [`window`](https://developer.mozilla.org/en-US/docs/Web/API/Window). It must implement: [`Window.prototype.location`](https://developer.mozilla.org/en-US/docs/Web/API/Window/location), [`Window.prototype.history`](https://developer.mozilla.org/en-US/docs/Web/API/Window/history), [`EventTarget.prototype.addEventListener`](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener) and [`EventTarget.prototype.removeEventListener`](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener). |
| `debounce`  | `0`               | (Optional) The delay in milliseconds before updating the browser URL when the reactive object is updated. This is useful in situations where URL updates happen frequently, e.g., on every keystroke. Note that this only affects the browser URL - the reactive object will always update immediately.                                                          |
| `serialise` | `JSON.stringify`  | (Optional) Control how query params are serialized to the URL. Note that this is **NOT** for encoding values into URI components - it serializes objects into strings, which will then be encoded internally. This is used for serialising complex objects like dates.                                                                                                                              |
| `adapter`   | [`browser`](#browser)        | (Optional) Provide a custom adapter that controls fetching/updating query params on both the server and in the browser.                                                                                                    |

### Example

```javascript
import { createUseQueryParams } from "svelte-query-params";

const useQueryParams = createUseQueryParams({ ... }, { 
  ... // Options here
})
```

## Adapters

As mentioned previously, adapters control how the URL is fetched and updated, both on the server and in the browser. As such, any adapter needs to implement the following interface:

- `isBrowser: () => boolean` - Returns `true` when are in the browser, and `false` otherwise.

- `server` - A property with the following methods:
  - `save(search: string) => void` - Update the server URL. Note that the `search` string has the `?` prefixed.

- `browser` - A property with the following methods:
  - `read() => URL | Location` - Retrieve the browser URL.
  - `save(search: string, hash: string) => void` - Update the browser URL. Note that the `search` string has the `?` prefixed and the `hash` string has the `#` prefixed.

To create your own adapter, you can import the `Adapter` type from `svelte-query-params/adapter` for intellisense, or use `defineAdapter` also exported by `svelte-query-params/adapter`:

```typescript
import type { Adapter } from 'svelte-query-params/adapter';
import { defineAdapter } from 'svelte-query-params/adapter';

export const myAdapter: Adapter = { ... }
export const myAdapter = defineAdapter({ ... });
```

### Browser

This is the default adapter when no adapter is specified and can only be used
in the browser i.e., fetching the URL on the browser returns an empty search string and hash and updating the query params on the server is a no-op.

```javascript
import { createUseQueryParams } from "svelte-query-params";
import { browser } from "svelte-query-params/adapters/browser";

const useQueryParams = createUseQueryParams({ ... }, { 
  adapter: browser({ ... })  
})
```

#### Browser Adapter Options

- `windowObj`: (Optional) Provide a custom implementation of [`window`](https://developer.mozilla.org/en-US/docs/Web/API/Window). It must implement:
  - [`Window.prototype.location`](https://developer.mozilla.org/en-US/docs/Web/API/Window/location)
  - [`Window.prototype.history`](https://developer.mozilla.org/en-US/docs/Web/API/Window/history)
  - [`EventTarget.prototype.addEventListener`](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener)
  - [`EventTarget.prototype.removeEventListener`](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener)

- `replace`: (Optional) If this is `true`, any browser query updates will not create a new browser session history item, replacing the previous one instead. If `false`, a new item will always be added to the history.

### SvelteKit

For use with SvelteKit, use this adapter, instead of the [`browser`](#browser) adapter for support for interacting with query params on the server.

```javascript
import { createUseQueryParams } from "svelte-query-params";
import { sveltekit } from "svelte-query-params/adapters/sveltekit";

const useQueryParams = createUseQueryParams({ ... }, { 
  adapter: sveltekit({ ... })  
})
```

#### SvelteKit Adapter Options

- `replace`: (Optional) If this is `true`, any browser query updates will not create a new browser session history item, replacing the previous one instead. If `false`, a new item will always be added to the history.

## Contributing

See [Contributing Guide](CONTRIBUTING.md).

## License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for more information.
