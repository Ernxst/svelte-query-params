<script lang="ts">
	import type { QueryParams } from "$lib";

	const { useQueryParams } = $props<{
		useQueryParams: () => QueryParams<{ count: number }>;
	}>();

	const params = useQueryParams();
</script>

<input name="number" bind:value={params.count} type="number" />
