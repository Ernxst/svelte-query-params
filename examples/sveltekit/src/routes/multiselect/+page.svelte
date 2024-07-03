<script lang="ts">
import { page } from "$app/stores";
import { useMultiSelectFilters } from "$lib/hooks/multi-select";

const [q, helpers] = useMultiSelectFilters($page.url);
const CATEGORIES = ["books", "electronics", "toys"];

function updateCategories(category: string) {
	const categories = q.categories.includes(category)
		? q.categories.filter((c) => c !== category)
		: [...q.categories, category];
	helpers.update({ categories });
}
</script>

<ul>
  {#each CATEGORIES as category}
    <li>
      <label>
        <input
          type="checkbox"
          value={category}
          onchange={() => updateCategories(category)}
          checked={q.categories.includes(category)}
        />
        {category}
      </label>
    </li>
  {/each}
</ul>

<ul>
  {#each q.categories as category}
    <li>{category}</li>
  {/each}
</ul>
