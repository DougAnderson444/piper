<script>
  import { onMount } from "svelte";
  import ObjectComp from "./ObjectComp.svelte";
  import AddPeer from "./AddPeer.svelte";
  import { root, rootHash, ipfsNode, portfolio, profile } from "./stores.js";
  import Head from "./Head.svelte";

  if (
    typeof window !== "undefined" &&
    localStorage.getItem("rootHash") &&
    localStorage.getItem("rootHash") != 0
  ) {
    // IPFS node rootHash stored, let's pull it up
    $rootHash = localStorage.getItem("rootHash");
    //console.log(`local storage: ${$rootHash}`)

    (async () => {
      // dag.get returns an IPLD format node
      $root = (await $ipfsNode.dag.get($rootHash)).value;
      //console.log(`New portfolio is ${JSON.stringify($root)}`)
    })();
  }

  // run this function to update hash any time the portfolio changes
  $: (async () => {
    // save initial portfolio to IPFS
    if ($root != 0) {
      //console.log(`updating rootHash for new portfolio ${JSON.parse(JSON.stringify($root))}`)
      $rootHash = await $ipfsNode.dag.put(JSON.parse(JSON.stringify($root)), {
        pin: true
      });
    }
  })();

  // save the rootHash to localstorage every time it changes (using $: in svelte)
  $: typeof window !== "undefined" && $rootHash != 0
    ? localStorage.setItem("rootHash", $rootHash)
    : false;
</script>

<style>
  div.outer {
    outline: 1px solid lightseagreen;
    padding: 15px;
  }
</style>

{#if $root}
  <div class="outer">
    <Head />
    <br />
    <AddPeer />
    {#each [...Object.entries($root).sort()] as [key, val]}
      <p>
        <ObjectComp breadcrumbs={[key]} {key} {val} expanded />
      </p>
    {/each}
  </div>
{:else}Loading portfolio...{/if}
