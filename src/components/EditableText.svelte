<script>
  import { tick } from "svelte";
  // Props
  export let value = "";
  export let type = "text";
  export let placeholder = "";
  export let labelClasses = "";
  export let inputClasses = "";
  let editing = false;
  let inputEl;
  let label;
  // Computed
  $: isText = type === "text";
  $: isNumber = type === "number";
  $: if (isNumber) {
    label = value === "" ? placeholder : value;
  } else if (isText) {
    label = value ? value : placeholder;
  }
  const toggle = async (event) => {
    editing = !editing;
    if (editing) {
      await tick();
      inputEl.focus();
    }
  };
  const handleInput = e => {
    value = isNumber ? +e.target.value : e.target.value;
  };
  const handleEnter = e => {
    if (e.keyCode === 13) inputEl.blur();
  };
  const handleBlur = _ => {
    if(value!="" && value != null)
      toggle();
    else
      value="Enter Value"
  };
</script>

{#if editing && (isText || isNumber)}
  <input
    class={inputClasses}
    bind:this={inputEl}
    {type}
    {value}
    {placeholder}
    on:input={handleInput}
    on:keyup={handleEnter}
    on:blur={handleBlur} />
{:else}
  <span contenteditable class={labelClasses} on:input={toggle} >{label}</span>
{/if}
