---
"svelte-query-params": minor
---

Require SvelteKit 3. The `sveltekit` adapter now imports `$app/env` and calls `goto` with `reset: false` in place of `keepFocus` and `noScroll`, so it no longer works on SvelteKit 2. The `svelte` peer range is now `^5.0.0`.
