<script>
  import { onMount } from "svelte";
  import ApiComp from "../components/Httpapi.svelte";
  import {put,get, getInfo, getRemoteDBInfo, replicate} from "../utils/db.js";
  let info, rinfo; //= getInfo();

  onMount(async () => {
    info = await getInfo();
    rinfo = await getRemoteDBInfo();
    let id = "publicKey1"
    var doc = {
      _id: id,
      name: "publicKey",
      cid: "hashValue"
    };

    await put(doc);
    let res = await get(id);
    console.log(res)
    await replicate();
  });
</script>

<ApiComp />

{#await info}
  <p>Waiting for PouchDb...</p>
{:then i}
  <p>PouchDb Info:</p>
  {JSON.stringify(i, null, 2)}
{:catch err}
  Sorry, {err}
{/await}

<p>
  {#await rinfo}
    <p>Waiting for Remote CouchDb...</p>
  {:then r}
    <p>PouchDb Info:</p>
    {JSON.stringify(r, null, 2)}
  {:catch err}
    Sorry, {err}
  {/await}

</p>
