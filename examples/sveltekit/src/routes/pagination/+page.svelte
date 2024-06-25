<script>
import { page } from "$app/stores";
import { usePagination } from "$lib/hooks/pagination";

const [params] = usePagination($page.url);

const nextPage = () => {
	params.page = Math.min(params.page + 1, 10);
};

const prevPage = () => {
	params.page = Math.max(params.page - 1, 1);
};
</script>

<button onclick={prevPage} disabled={params.page === 1}>Previous</button>
<button onclick={nextPage} disabled={params.page === 10}>Next</button>
<p>Current Page: {params.page}</p>
