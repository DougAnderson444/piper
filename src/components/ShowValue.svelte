<script>
  import EditableText from "./EditableText.svelte";
  import { root } from "./stores.js";
  import { saveDeepValue } from "./utils.js";

  export let val;
  export let breadcrumbs = [];

  // need an "on done editing" event to fire from EditableText
  function saveValue() {
    console.log(`Saving: ${val} to crumbs: ${breadcrumbs}`);
    saveDeepValue($root, breadcrumbs, val)
    $root = $root;
    console.log(`new root is ${JSON.stringify($root, null, 2)}`);
  }

</script>

<EditableText bind:value={val} on:doneEditing={saveValue} />
