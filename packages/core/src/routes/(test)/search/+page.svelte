<script lang="ts">
import { page } from "$app/stores";
import { useSearchFilters } from "./_hooks/search";

const [q] = useSearchFilters($page.url);
</script>

<input type="text" bind:value={q.q} placeholder="Search..." role="searchbox" />
<select bind:value={q.category}>
  <option value="">All Categories</option>
  <option value="books">Books</option>
  <option value="electronics">Electronics</option>
</select>
