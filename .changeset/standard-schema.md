---
"svelte-query-params": minor
---

Validate with [Standard Schema](https://standardschema.dev) instead of bundled zod and valibot support. Any compliant library works, including zod 3.24+, zod 4, valibot 1 and ArkType, and `zod` and `valibot` are no longer dependencies or peer dependencies. A failed validation now throws a `SchemaValidationError` with the schema's `issues`, in place of `ZodError` or `ValiError`, and async schemas throw. The `ZodValidator` and `ValibotValidator` types are replaced by `SchemaValidator`.
