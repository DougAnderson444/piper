<script>
    import { onMount } from 'svelte';
	import Folder from "./Folder.svelte";
	import AddPeer from './AddPeer.svelte';
	import { rootHash, ipfsNode, portfolio } from './stores.js'

	if(typeof window !== 'undefined' && localStorage.getItem('rootHash') && localStorage.getItem('rootHash')!=0 ){
		// IPFS node rootHash stored, let's pull it up
		let someData = localStorage.getItem('rootHash')
		console.log(`local storage: ${someData}`)
		$rootHash = someData;
		
		(async()=>{
			// dag.get returns an IPLD format node
			$portfolio = (await $ipfsNode.dag.get($rootHash)).value; 
			console.log(`New portfolio is ${JSON.stringify($portfolio)}`)
		})();
	}else{
		// load a default template
		let uuids = [
					"123", 
					"456",
					"678"
					];
		let settings = []

		$portfolio = [
			{ key: "uuids", value: uuids },
			{ key: "Settings", value: settings }
		];
	}
	// run this function any time the portfolio changes
	$:(async()=>{
		// save initial portfolio to IPFS
		if($portfolio!=0){
			console.log(`updating rootHash for new portfolio ${JSON.stringify($portfolio)}`)
			$rootHash = await $ipfsNode.dag.put($portfolio, { pin: true })
		}
	})()

	// save the rootHash to localstorage every time it changes ($: )     
    $: (typeof window !== 'undefined' && $rootHash!=0) ? localStorage.setItem('rootHash', $rootHash) : false;


</script>
<style>
    div.outer {
		outline: 1px solid lightseagreen;
		padding: 15px;
	}
</style>

{#if $portfolio}
<div class='outer'>
	<Folder name="Portfolio" bind:items={$portfolio} expanded head={true} />
	<AddPeer />
</div>  
{:else}
  Loading portfolio...?
{/if}