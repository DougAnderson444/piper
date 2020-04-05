<script>
  import EditableText from "./EditableText.svelte";
  import { root } from "./stores.js";

  export let key;
  export let val;
  export let breadcrumbs = [];

    //console.log(`crumbs: ${breadcrumbs.concat(keys)} vals:${vals}`);
//    drill($root, breadcrumbs.concat(key), val);
    //console.log(`root is ${JSON.stringify($root, null, 2)}`);

  // Drill down into the object until reach key:value pair
  function drill(obj, crumbs, value) {
    if (crumbs.length > 1) {
      var e = crumbs.shift();
      drill(obj[e], crumbs, value);
    } else obj[crumbs[0]] = value;
  }
</script>
<EditableText bind:value={key} />: <EditableText bind:value={val} />