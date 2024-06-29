<script lang="ts">
import { page } from "$app/stores";
import { useTabs } from "./_hooks/tabs";

const [q] = useTabs($page.url);
const onHomeTab = $derived(q.tab === "home");
const onUserTab = $derived(q.tab === "users");
</script>

<header class="tabs">
  <div role="tablist" aria-label="Tabs" aria-orientation="horizontal">
    <button
      id="home-tab"
      role="tab"
      disabled={onHomeTab}
      aria-selected={onHomeTab}
      aria-controls="home"
      tabindex={onHomeTab ? 0 : -1}
      onclick={() => (q.tab = "home")}
    >
      Home
    </button>
    <button
      id="users-tab"
      role="tab"
      disabled={onUserTab}
      aria-selected={onUserTab}
      aria-controls="users"
      tabindex={onUserTab ? 0 : -1}
      onclick={() => (q.tab = "users")}
    >
      Users
    </button>
  </div>
</header>

<section>
  <div
    id="home"
    role="tabpanel"
    aria-labelledby="home-tab"
    tabindex="0"
    hidden={!onHomeTab}
  >
    <h1 id="title">Home Page</h1>
    <p>You are on the home page</p>
  </div>
  <div
    id="users"
    role="tabpanel"
    aria-labelledby="users-tab"
    tabindex="0"
    hidden={!onUserTab}
  >
    <h1 id="title">Users Page</h1>
    <p>You are on the users page</p>
  </div>
</section>

<style>
  .tabs {
    padding: 1em;
  }

  [role="tablist"] {
    margin-bottom: -1px;
  }

  [role="tab"] {
    position: relative;
    z-index: 1;
    background: white;
    border-radius: 5px 5px 0 0;
    border: 1px solid grey;
    border-bottom: 0;
    padding: 0.2em;
  }

  [role="tab"][aria-selected="true"] {
    z-index: 3;
  }

  [role="tabpanel"] {
    position: relative;
    padding: 0 0.5em 0.5em 0.7em;
    border: 1px solid grey;
    border-radius: 0 0 5px 5px;
    background: white;
    z-index: 2;
  }

  [role="tabpanel"]:focus {
    border-color: orange;
    outline: 1px solid orange;
  }
</style>
