<script lang="ts">
import type { UseQueryHook } from "$lib";

const {
	useQueryParams,
}: {
	useQueryParams: UseQueryHook<{ count: number }>;
} = $props();

const [params] = useQueryParams();

function increment() {
	params.count += 1;
}
</script>

<button onclick={increment}>
  count is {params.count}
</button>
