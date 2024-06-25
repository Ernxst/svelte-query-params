<script lang="ts">
import { page } from "$app/stores";
import { useSearchFilters } from "$lib/hooks/search";

const [params] = useSearchFilters($page.url);
</script>

<input type="text" bind:value={params.q} placeholder="Search..." />
<select bind:value={params.category}>
  <option value="">All Categories</option>
  <option value="books">Books</option>
  <option value="electronics">Electronics</option>
</select>
