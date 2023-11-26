<script lang="ts">
	import type { QueryParams } from "$lib";

	const { useQueryParams } = $props<{
		useQueryParams: () => QueryParams<{ count: number }>;
	}>();

	const params = useQueryParams();

	function increment() {
		params.count += 1;
	}
</script>

<button onclick={increment}>
	count is {params.count}
</button>
