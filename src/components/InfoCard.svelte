<script>
    import EditableText from "./EditableText.svelte";    
	//import Fa from "svelte-fa";
    //import { faFlag, faPlus, faCertificate, faUserCheck } from "@fortawesome/free-solid-svg-icons";
    
    export let items;
	export let certified = false;
	if(items && items.hasOwnProperty("certified") && items.certified===true) certified = true;

	//console.log(`Info Card items: ${items}`)

</script>

<style>
	.contact-card {
	  width: 300px;
	  border: 1px solid #aaa;
	  border-radius: 2px;
	  box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.1);
	  padding: 1em;
	}

	h3 {
	  padding: 0 0 0.2em 0;
	  margin: 0 0 1em 0;
	  border-bottom: 1px solid green;
	}

	.certified {
      color: limegreen !important;
	}
</style>
{#if !items.key}
{items}
{:else}
<article class="contact-card">
	<h3>
			<span><EditableText placeholder={items.key} /></span> <span class:certified>*<!--Fa icon={faCertificate} /--></span>
	</h3>

	<div class="value">
		<slot name="value">
			<span><EditableText placeholder={items.value} /></span>
		</slot>
	</div>

</article>
{/if}