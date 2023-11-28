<script lang="ts">
	import type { EventHandler } from "svelte/elements";
	import { useQueryParams } from "./params";

	const params = useQueryParams();

	function increment() {
		params.count += 1;
	}

	const submit: EventHandler<SubmitEvent, HTMLFormElement> =
		async function submit(event) {
			event.preventDefault();

			const form = event.target as HTMLFormElement;
			const data = new FormData(form);
			// @ts-expect-error it's fine
			const params = new URLSearchParams([...data.entries()]);
			const query = `?${params}`;
			window.history.pushState(null, "", query);
		};
</script>

<button onclick={increment}>
	count is {params.count}
</button>

<section>
	{#each params.keys() as key}
		<label>
			{key}
			<input name={key} bind:value={params[key]} />
		</label>
	{/each}
</section>

<section class="browser">
	<p>
		Updating the values here should update the browser URL, and the reactive
		counter above.
	</p>
	<form onsubmit={submit}>
		{#each params.entries() as [key, value]}
			<label>
				{key}
				<input name={key} {value} />
			</label>
		{/each}

		<button type="submit">Update Browser Params</button>
	</form>
</section>

<style>
	form {
		display: flex;
		gap: 0.5rem;
		flex-direction: column;
		align-items: center;
	}

	label {
		text-transform: capitalize;
	}

	form button {
		width: fit-content;
	}
</style>
