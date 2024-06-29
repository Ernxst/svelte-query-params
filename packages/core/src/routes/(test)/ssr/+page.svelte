<script lang="ts">
import { page } from "$app/stores";
import { useQueryParams } from "./params";

const [q] = useQueryParams($page.url);
</script>

<h1>Count: {$page.url.searchParams.get("count")}</h1>
<h2>Count: {q.count}</h2>
