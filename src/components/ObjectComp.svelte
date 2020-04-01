<script>
  import KeyValue from "./KeyValue.svelte";
  import EditableText from "./EditableText.svelte";
  import { root } from "./stores.js";

  export let props; //root at first
  export let breadcrumbs = [];
  export let expanded = false;
  export let name;

  function toggle() {
    expanded = !expanded;
  }
</script>

<style>
	span {
	  padding: 0 0 0 0em;
	  background: url(tutorial/icons/folder.svg) 0 0.1em no-repeat;
	  background-size: 1em 1em;
	  font-weight: bold;
	  cursor: pointer;
	}

	.expanded {
	  background-image: url(tutorial/icons/folder-open.svg);
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

<span class:expanded on:click={toggle}><EditableText bind:value={name}/></span>
				
{#if expanded}

<ul>
	{#each [...Object.entries(props)] as [key, val]}
		<li>
			{#if typeof val === 'object'}
				<svelte:self props={val} name={key} breadcrumbs={breadcrumbs.concat(key)} />
			{:else}
                <KeyValue {breadcrumbs} {key} {val} />
			{/if}
		</li>
	{/each}
</ul>
{/if}