<script>
  //import Key from "./Key.svelte";
  //import Value from "./Value.svelte";
  //import EditableText from "./Menu.svelte";
  import { root } from "./stores.js";

  export let breadcrumbs = [];
  let key;

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
  }
  const handleEnter = e => {
    if (e.keyCode === 13) folderText.blur();
  };
  const newfolder = () => {
    closeMenu();
    drill($root, breadcrumbs.concat(["New Folder"]));
    console.log(`new root is ${JSON.stringify($root, null, 2)}`);
    $root = $root; //necessary for main page to refresh values
  };
  const newfile = () => {
    drill($root, breadcrumbs.concat(["New Entry"]), "New Value");
    console.log(`new root is ${JSON.stringify($root, null, 2)}`);
    $root = $root; //necessary for main page to refresh values
    closeMenu();
  };
  function drill(obj, crumbs, value = {}) {
    if (crumbs.length > 1) {
      var e = crumbs.shift();
      drill(obj[e], crumbs, value);
    } else obj[crumbs[0]] = value; //last recursive iteration
  }
</script>

<style>
  span {
    padding: 0 0 0 0.1em;
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
  .menu {
    -webkit-border-radius: 6px;
    -moz-border-radius: 6px;
    border-radius: 6px;
    -webkit-box-shadow: 0px 0px 1px #d3d3d3;
    -moz-box-shadow: 0px 0px 1px #d3d3d3;
    box-shadow: 0px 0px 1px #d3d3d3;
    background-color: #eee;
    padding: 10px;
    margin: 1em;
    font-family: Verdana, Geneva, sans-serif;
    font-size: 10pt;
    color: #000000;
    text-align: left;
    width: 50%;
    height: fit-content;
  }
  button {
    cursor: pointer;
    float: right;
    position: relative;
    top: -15px;
    right: -15px;
  }
</style>

<span class="elip" on:click={toggleMenu} />

<div class:menu hidden={!menu}>

  <button on:click={closeMenu}>x</button>
  <br style="clear:all;" />
  <div>
    <span on:click={newfolder}>New Folder in {key}</span>
    <br />(or)<br />
    <span on:click={newfile}>New File in {key}</span>
  </div>


</div>