<script lang="ts">
import type { UseQueryHook } from "../../types.ts";

const {
	useQueryParams,
}: {
	useQueryParams: UseQueryHook<{ count: number; id: number }>;
} = $props();

const [params, helpers] = useQueryParams();

function updateOne() {
	helpers.update({ count: params.count + 1 });
}
</script>

<input name="count" value={params.count} disabled type="number" />
<input name="id" value={params.id} disabled type="number" />

<button onclick={updateOne}> Click here to update count </button>
