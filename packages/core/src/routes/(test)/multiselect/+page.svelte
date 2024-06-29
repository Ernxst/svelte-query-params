<script lang="ts">
import { page } from "$app/stores";
import { useMultiSelectFilters } from "./_hooks/multi-select";

const [q, helpers] = useMultiSelectFilters($page.url);

function updateCategories(category: string) {
	const categories = q.categories.includes(category)
		? q.categories.filter((c) => c !== category)
		: [...q.categories, category];
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
        checked={q.categories.includes("books")}
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
        checked={q.categories.includes("electronics")}
      />
      Electronics
    </label>
  </li>
</ul>
