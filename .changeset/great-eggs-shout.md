---
"svelte-query-params": patch
---

### New Features

- Query params can now be set on the server

### Breaking Changes

- Removed the `hash` argument in the `save` method of the server handler in an adapter.
  - This is because the server will never receive the hash

- Renamed the `dom` adapter to `browser` as the name fits better with what it does

### Fixes

- The options the SvelteKit adapter takes is now exported
- Add event listeners to window if `createUseQueryParams` is registered on the server first
- Values in the "helpers" returned were previously not reactive
- Ensure the `keys()` helper method returns the correct values when passing in a schema
- The search string from the helpers now includes all query params, not just params defined in validators
- Ensure all search params are persisted to browser/server, not just params defined in validators
- The parsed query was allowing values not defined in validators to passthrough, now fixed
- Fix valibot schema check now that minimum valibot version has been upgraded
