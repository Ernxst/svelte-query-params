---
"svelte-query-params": patch
---

(breaking) Server-side fixes


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
