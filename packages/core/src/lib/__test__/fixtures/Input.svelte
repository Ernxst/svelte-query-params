<script lang="ts">
import type { UseQueryHook } from "../../types";

const {
	useQueryParams,
}: {
	useQueryParams: UseQueryHook<{ count: number }>;
} = $props();

const [params] = useQueryParams(window.location);
</script>

<input name="number" bind:value={params.count} type="number" />
