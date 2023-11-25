<script lang="ts">
	import type { QueryParams } from "../../types.ts";

	const { useQueryParams } = $props<{
		useQueryParams: () => QueryParams<{ count: any; id: any }>;
	}>();

	const params = useQueryParams();

	function updateOne() {
		params.update({ count: params.count + 1 });
	}
</script>

<input name="count" value={params.count} disabled />
<input name="id" value={params.id} disabled />

<button onclick={updateOne}> Click here to update count </button>
