<script lang="ts">
  import type { UseQueryHook } from "../../types";

  const { useQueryParams } = $props<{
    useQueryParams: UseQueryHook<{ count: number }>;
  }>();

  const [params] = useQueryParams();
</script>

<input name="number" bind:value={params.count} type="number" />
