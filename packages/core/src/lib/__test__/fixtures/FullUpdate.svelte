<script lang="ts">
  import type { UseQueryHook } from "../../types.ts";

  const { useQueryParams } = $props<{
    useQueryParams: UseQueryHook<{ count: number; id: number }>;
  }>();

  const [params, helpers] = useQueryParams();

  function updateAll() {
    helpers.set({ count: params.count + 1, id: params.id + 1 });
  }
</script>

<input name="count" value={params.count} disabled type="number" />
<input name="id" value={params.id} disabled type="number" />

<button onclick={updateAll}> Click here to update all </button>
