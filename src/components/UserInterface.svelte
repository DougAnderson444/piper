<script>
  import { onMount } from "svelte";
  import ObjectComp from "./ObjectComp.svelte";
  import AddPeer from "./AddPeer.svelte";
  import { root, rootHash, defaultObj, ipfsNode, portfolio, profile } from "./stores.js";
  import Head from "./Head.svelte";
  import IPFS from "ipfs";

  if (
    typeof window !== "undefined" &&
    localStorage.getItem("rootHash") &&
    localStorage.getItem("rootHash") != 0 &&
    IPFS.isIPFS.cid(localStorage.getItem("rootHash"))
  ) {
    // IPFS node rootHash stored, let's pull it up
    console.log(`IPFS node rootHash stored, let's pull it up`);

    ;(async () => {
      // dag.get returns an IPLD format node
      $root = (await $ipfsNode.dag.get(localStorage.getItem("rootHash"))).value;
      console.log(`Loaded Portfolio is ${JSON.stringify($root)}`)
    })();
  }else{
    console.log(`LocalStorage didnt load hash.`)
    $root = $defaultObj; //load from default
  }
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
        <ObjectComp breadcrumbs={[key]} {key} {val} />
      </p>
    {/each}
  </div>
{:else}Loading portfolio...{/if}
