<script lang="ts">
	import type { QueryParams } from "../../types.ts";

	const { useQueryParams } = $props<{
		useQueryParams: () => QueryParams<{ count: any; id: any }>;
	}>();

	const params = useQueryParams();

	function updateAll() {
		params.set({ count: params.count + 1, id: params.id + 1 });
	}
</script>

<input name="count" value={params.count} disabled />
<input name="id" value={params.id} disabled />

<button onclick={updateAll}> Click here to update all </button>
