# svelte-query-params

## 0.2.1

### Patch Changes

- 06cd15f: (breaking) Server-side fixes

  ### Bug Fixes

  - The SvelteKit adapter no longer reads from the `page` store as this cannot be subscribed to on the server

  ### Breaking Changes

  - Restructure adapter API
    - The server handler no longer needs to read and return the current URL
    - The browser handler must now return the full URL/location instead of just the search string and hash
  - The returned function from `createUseQueryParams` now requires a `URL | Location` param
    - This was only really required on the server, but was also required on the client too so usage of the hook does differ between server and client.
    - If needed, consumers can create a client wrapper around it which will pass `window.location` or the URL from the page store

  ### Internals

  - remove `console.log` - not sure if a Svelte upgrade fixed things or this refactor did, but it is (thankfully) no longer needed

## 0.2.0

### Minor Changes

- 142bd13: (breaking): Upgrade minimum supported node, SvelteKit and Valibot versions

  - Most of this release is updating its internals with no updates to existing behaviour, excluding the version requirements above

## 0.1.0

### Minor Changes

- [`c9ecf16`](https://github.com/Ernxst/svelte-query-params/commit/c9ecf16df563e1af0b386e17d125f922a5ed83d6) Thanks [@Ernxst](https://github.com/Ernxst)! - Restructure API usage

## 0.0.2

### Patch Changes

- [`3f9f374`](https://github.com/Ernxst/svelte-query-params/commit/3f9f3743c778d08d86fb30647793b52ca6d0159f) Thanks [@Ernxst](https://github.com/Ernxst)! - release
