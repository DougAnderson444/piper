<script>
/*
Deprecated, replaced with ShowKey and ShowValue components
*/
  import EditableText from "./EditableText.svelte";
  import { root } from "./stores.js";

  export let key;
  export let val;
  export let breadcrumbs = [];

  // need an "on done editing" event to fire from EditableText
  function saveValue() {
    console.log(`Saving: ${val} to crumbs: ${breadcrumbs}`);
    drill($root, breadcrumbs, val);
    $root = $root;
    console.log(`new root is ${JSON.stringify($root, null, 2)}`);
  }

  // Drill down into the object until reach key:value pair
  function drill(obj, crumbs, value = {}) {
    if (crumbs.length > 1) {
      var e = crumbs.shift();
      drill(obj[e], crumbs, value);
    } else obj[crumbs[0]] = value;
  }

  function saveKey() {
    console.log(`Saving key`);
    replaceKey($root, breadcrumbs, key);
    $root = $root;
    console.log(`new root is ${JSON.stringify($root, null, 2)}`);
  }

  // Drill down into the object until reach key:value pair
  function replaceKey(obj, crumbs, newKey) {
    if (crumbs.length > 1) {
      var e = crumbs.shift();
      replaceKey(obj[e], crumbs, newKey);
    } else {
      // when you get to the last key,
      // replace the oldKey with the newKey, delete the 
      // oldKey = crumbs[0]
      //console.log(`obj: ${JSON.stringify(obj)} \n newKey: ${newKey} \n oldKey: ${crumbs[0]}`)
      //if (crumbs[0] !== newKey) { delete Object.assign(obj, { [newKey]: obj[crumbs[0]] })[crumbs[0]]; }
      if (crumbs[0] !== newKey) {
        Object.defineProperty(
          obj,
          newKey,
          Object.getOwnPropertyDescriptor(obj, crumbs[0])
        );
        delete obj[crumbs[0]];
      }
    }
  }
</script>

<EditableText bind:value={key} on:doneEditing={saveKey} />
{#if Object.keys(val).length != 0 && val.constructor != Object}
  :
  <EditableText bind:value={val} on:doneEditing={saveValue} />
{/if}
