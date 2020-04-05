<script>
	//import Key from "./Key.svelte";
	//import Value from "./Value.svelte";
	//import EditableText from "./Menu.svelte";
	import { root } from "./stores.js";

	export let breadcrumbs = [];
	let key;
	export let entry = {};

	if (breadcrumbs.length - 1 > 0) {
	  key = `New in ${breadcrumbs[breadcrumbs.length - 1]}`;
	} else {
	  key = breadcrumbs;
	} //default

	let folderText;

	let elip;
	let menu = false;

	function toggleMenu() {
	  menu = !menu;
	}
	function closeMenu() {
      menu = false;
      console.log(`closing menu`)
	};
	const handleEnter = e => {
	  if (e.keyCode === 13) folderText.blur();
	};
	const newfolder = () => {
        // breadcrumbs must include the "New Key" folder name
        entry.val = "New Folder"
        closeMenu();
        drill($root, breadcrumbs.concat(["New Folder"]))
        console.log(`new root is ${JSON.stringify($root, null, 2)}`);
        $root = $root //necessary for main page to refresh values
    };
    const newfile = () => {
        closeMenu();
    }
    function drill(obj, crumbs, value = {}) {
        if (crumbs.length > 1) {
            var e = crumbs.shift();
            drill(obj[e], crumbs, value);
        } else obj[crumbs[0]] = value; //last recursive iteration
    }

</script>

<style>
	span {
	  padding: 0 0 0 1.5em;
	  font-weight: bold;
	  cursor: pointer;
	}

	.elip:before {
	  content: "\f141";
	  font: normal normal normal 0.75em/1 FontAwesome;
	  color: #ccc;
	  padding-left: 0.5em;
	  margin-left: 0em;
	}
</style>

<span class=elip on:click={toggleMenu} ></span>

<div class:menu hidden={!menu}>
	<!-- entry[.key, .val] = (self && false) || (Key && Value) -->
	<span on:click={newfolder}>New Folder in {key}</span>
	<br>(or)<br> 
	<span on:click={newfile}>New File in {key}</span>
	
<button hidden={!menu} on:click={closeMenu} >x</button>

</div>