<script lang="ts">
import { page } from "$app/state";
import { useQueryParams } from "./params";

const [q] = useQueryParams(page.url);
</script>

<input type="text" bind:value={q.q} role="searchbox" />
<p id="store">{q.q}</p>
