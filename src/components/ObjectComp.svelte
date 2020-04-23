<script>
  //import KeyValue from "./KeyValue.svelte";
  import ShowKey from "./ShowKey.svelte";
  import ShowValue from "./ShowValue.svelte";
  import EditableText from "./EditableText.svelte";
  import Menu from "./Menu.svelte";
  import { root, ipfsNode } from "./stores.js";
  import IPFS from "ipfs";

  export let breadcrumbs = [];
  export let key;
  export let val;
  export let expanded = false;
  let isCID, contactsData;
  console.log(`key=${key} \n val=${JSON.stringify(val)}`);

  // preprocess value
  if (val.hasOwnProperty('/') && IPFS.isIPFS.cid(val['/'])) {
    console.log(`1. IS CID: ${JSON.stringify(val)}`);
    isCID = true;
  } else {
    console.log(`1. Folder opened, key=${key} not CID: ${JSON.stringify(val)}`);
  }

  if (isCID) {
    (async () => {
      try {
        contactsData = (await $ipfsNode.dag.get(val['/'])).value;
        console.log(`contactsData: ${contactsData}`);
      } catch (err) {
        console.log(err);
      }
    })();
  }

  function toggle() {
    expanded = !expanded;
  }
</script>

<style>
  span {
    background-size: 1em 1em;
    font-weight: bold;
    cursor: pointer;
  }

  .expanded:before {
    content: "\f07c";
    font: normal normal normal 1.5em/1 FontAwesome;
    color: #ccc;
    padding-right: 0.1em;
    margin-right: 0.1em;
  }

  .menuclosed:before {
    content: "\f07b";
    font: normal normal normal 1.5em/1 FontAwesome;
    color: #ccc;
    padding-right: 0.1em;
    margin-right: 0.1em;
  }
  ul {
    padding: 0.2em 0 0 0em;
    margin: 0 0 0 0em;
    list-style: none;
    border-left: 1px solid #ddd;
  }

  li {
    padding: 0.2em 0;
    margin: 0.15em 1em;
  }
</style>

<span class:menuclosed={!expanded} on:click={toggle} />
<span class:expanded on:click={toggle}>
  <ShowKey {key} {breadcrumbs} />
</span>

{#if expanded}
  <Menu {breadcrumbs} />
  <ul>
    {#each [...Object.entries(val).sort()] as [key, val]}
      <li>
        {#if typeof val === 'object'}
          <svelte:self {key} {val} breadcrumbs={breadcrumbs.concat(key)} />
        {:else if isCID}
          <svelte:self
            {key}
            bind:val={contactsData}
            breadcrumbs={breadcrumbs.concat(key)} /> 
        {:else}
          <ShowKey {key} breadcrumbs={breadcrumbs.concat(key)} />
          :
          <ShowValue {val} breadcrumbs={breadcrumbs.concat(key)} /> 
        {/if}
      </li>
    {/each}
  </ul>
{/if}
