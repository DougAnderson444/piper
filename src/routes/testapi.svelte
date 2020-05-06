<script>
  import { onMount } from "svelte";
  import ApiComp from "../components/Httpapi.svelte";
  import { getInfo, replicate } from "../utils/db.js";
  let info //= getInfo();

  onMount(async() => {
    info = await getInfo();
  });

</script>

<ApiComp />

{#await info}
  <p>Waiting for PouchDb...</p>
{:then i}
  <p>PouchDb Info:</p>
  {JSON.stringify(i,null,2)}
{:catch err}
  Sorry, {err}
{/await}
