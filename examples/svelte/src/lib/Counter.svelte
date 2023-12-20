<script lang="ts">
  import type { EventHandler } from "svelte/elements";
  import { useQueryParams } from "./params";
  import { string } from "zod";

  const [params, helpers] = useQueryParams();

  function increment() {
    params.count += 1;
  }

  const submit: EventHandler<SubmitEvent, HTMLFormElement> =
    async function submit(event) {
      event.preventDefault();

      const params = new URLSearchParams(window.location.search);
      const form = event.target as HTMLFormElement;
      const data = new FormData(form);
      [...data.entries()].forEach(([key, value]) =>
        params.set(key, String(value)),
      );

      window.history.pushState(null, "", `?${params}`);
    };
</script>

<pre>
	{JSON.stringify(helpers.all)}
</pre>

<button onclick={increment}>
  count is {params.count}
</button>

<section>
  {#each helpers.keys() as key}
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
    {#each helpers.entries() as [key, value]}
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
