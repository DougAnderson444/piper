<script>
    import { onMount } from 'svelte';
	import Folder from "./Folder.svelte";
	import AddPeer from './AddPeer.svelte';
	import { rootHash, ipfsNode, portfolio, profile } from './stores.js'

	if(typeof window !== 'undefined' && localStorage.getItem('rootHash') && localStorage.getItem('rootHash')!=0 ){
		// IPFS node rootHash stored, let's pull it up
		let someData = localStorage.getItem('rootHash')
		console.log(`local storage: ${someData}`)
		$rootHash = someData;
		
		(async()=>{
			// dag.get returns an IPLD format node
			$portfolio = (await $ipfsNode.dag.get($rootHash)).value; 
			//console.log(`New portfolio is ${JSON.stringify($portfolio)}`)
		})();
	}else{
		// load a default template

/*
Scheme rules
Profile is a list = Array
each item in the list is an object
first key in the object is the title of the object
the value assoc with the first key can be a simple value, or another array
the object can have tags, but array items cannot have tags (they'd have to become objects)
*/
		let uuids = [];
		let contact = [
			{key: "Name", value:"Bob"},
			{key: "Phone", value:"555-555-1234"}
			]

		$profile = [
			{"Favorite Color(s)":["Blue"], tags: ["car", "dress shirt"] },
			{"Links":[
				{"Brave": "https://brave.com/dou750"}, 
				"Communications"
				], tags: ["resume", "skills"] },
			{"Skills":[
				{"skill": "Presentation"}, 
				{"skill": "Communications"}
				], tags: ["resume", "skills"] },
			{"Experiences":[
				{"Naval Officer":[
					{"Start":"1997",
					 "Finish":"2017", 
					 "Employer":"Royal Canadian Navy"}
					]},
				{"Public Service":["2017-2019","Dept National Defence"]}
				], tags: ["resume", "experience"] },
			{"Contact Details":[
				{"Phone":["Mobile","613-555-1234"], tags:["preferred"]},
				{"Phone":["Office","819-555-1234"], tags:["voicemail"]},
				{"email":"doug@peerpiper.io"}
				], tags: ["resume", "experience"] },
			] 
/*
		$portfolio = [
			{ profile: profile },
			{ key: "uuids", 		value: uuids, tags: [] },
			{ key: "Contact Info", 	value: contact, tags: []  }
		];
*/

		$portfolio = [
			{ profile: $profile },
			{ key: "uuids", value: uuids }
		];

	}
	// run this function any time the portfolio changes
	$:(async()=>{
		// save initial portfolio to IPFS
		if($portfolio!=0){
			console.log(`updating rootHash for new portfolio ${JSON.parse(JSON.stringify($portfolio))}`)
			$rootHash = await $ipfsNode.dag.put(JSON.parse(JSON.stringify($portfolio))) //, { pin: true }
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