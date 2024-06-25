<script lang="ts">
import { page } from "$app/stores";
import { useMultiSelectFilters } from "$lib/hooks/multi-select";

const [params, helpers] = useMultiSelectFilters($page.url);

function updateCategories(category: string) {
	const categories = params.categories.includes(category)
		? params.categories.filter((c) => c !== category)
		: [...params.categories, category];
	helpers.update({ categories });
}
</script>

<ul>
  <li>
    <label>
      <input
        type="checkbox"
        value="books"
        onchange={() => updateCategories("books")}
        checked={params.categories.includes("books")}
      />
      Books
    </label>
  </li>
  <li>
    <label>
      <input
        type="checkbox"
        value="electronics"
        onchange={() => updateCategories("electronics")}
        checked={params.categories.includes("electronics")}
      />
      Electronics
    </label>
  </li>
</ul>
