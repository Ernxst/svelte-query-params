<script>
import { page } from "$app/stores";
import { usePagination } from "./_hooks/pagination";

const [q] = usePagination($page.url);

const nextPage = () => {
	q.page = Math.min(q.page + 1, 10);
};

const prevPage = () => {
	q.page = Math.max(q.page - 1, 1);
};
</script>

<h1>Current Page: {q.page}</h1>
<h2>Page Size: {q.pageSize}</h2>

<button onclick={prevPage} disabled={q.page === 1}>Previous</button>
<button onclick={nextPage} disabled={q.page === 10}>Next</button>
