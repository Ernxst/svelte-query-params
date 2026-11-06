---
"svelte-query-params": minor
---

The `sveltekit` adapter now reads SvelteKit's reactive `page.url` instead of patching `window.history`, so the query params follow every SvelteKit navigation. Rapid updates, such as typing, now make one history entry per burst in place of one per keystroke, and URL changes made by calling `history.pushState` directly are no longer seen. Adapters can opt into this by setting `reactive: true` on their `browser` property.
