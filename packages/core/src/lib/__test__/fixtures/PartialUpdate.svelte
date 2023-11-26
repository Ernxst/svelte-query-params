<script lang="ts">
	import type { QueryParams } from "../../types.ts";

	const { useQueryParams } = $props<{
		useQueryParams: () => QueryParams<{ count: number; id: number }>;
	}>();

	const params = useQueryParams();

	function updateOne() {
		params.update({ count: params.count + 1 });
	}
</script>

<input name="count" value={params.count} disabled type="number" />
<input name="id" value={params.id} disabled type="number" />

<button onclick={updateOne}> Click here to update count </button>
