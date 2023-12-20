<script lang="ts">
  import type { UseQueryHook } from "$lib";

  const { useQueryParams } = $props<{
    useQueryParams: UseQueryHook<{ count: number }>;
  }>();

  const [params] = useQueryParams();

  function increment() {
    params.count += 1;
  }
</script>

<button onclick={increment}>
  count is {params.count}
</button>
