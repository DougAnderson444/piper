<script>
  import KeyValue from "./KeyValue.svelte";
  import EditableText from "./EditableText.svelte";
  import { root } from "./stores.js";

  export let breadcrumbs = [];
  export let key;
  export let val;
  export let expanded = false;
  //console.log(`key is ${JSON.stringify(key)}`);
  //key["Cat 1"] = "Symba"; // works at the top only

  function toggle() {
    expanded = !expanded;
  }
</script>

<style>
	span {
	  background: url(tutorial/icons/folder.svg) 0 0.1em no-repeat;
	  background-size: 1em 1em;
	  font-weight: bold;
	  cursor: pointer;
	}

	.expanded {
	  background-image: url(tutorial/icons/folder-open.svg);
	}
	.expanded:before {
	  content: "\f07c";
	  font: normal normal normal 0.75em/1 FontAwesome;
	  color: #ccc;
	  padding: 0.2em 0 0 0em;
	  margin: 0.2em;
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

	.selectdiv:before {
	  content: "\f07b";
	  font: normal normal normal 0.75em/1 FontAwesome;
	  color: #ccc;
	  padding-right: 0.1em;
	  margin-right: 0em;
	}
</style>

<span class:selectdiv={!expanded}></span>
<span class:expanded on:click={toggle}>
	<EditableText bind:value={key}/>
</span>
				
{#if expanded}

<ul>
	{#each [...Object.entries(val)] as [key, val]}
		<li>
			{#if typeof val === 'object'}
				<svelte:self {key} {val} breadcrumbs={breadcrumbs.concat(key)} />
			{:else}
        		<KeyValue {key} {val}  breadcrumbs={breadcrumbs.concat(key)} />
			{/if}
		</li>
	{/each}
	<li>+</li>
</ul>
{/if}