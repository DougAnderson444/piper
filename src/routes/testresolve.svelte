<script>
  // test name.resolve(username.peerpiper.io) on the server
  import createIPFS, { resolve } from "../../Ipfs.js";

  export let value, results;

  const handleSubmit = () => {
    results = resolve(ipfsNode, value);
  };
</script>

<div>

  <form on:submit|preventDefault={handleSubmit}>
    <h2>Resolve a PeerPiper name</h2>

    <input type="text" placeholder="username.peerpiper.io" bind:value />

  </form>

  <br />

  <h3>Results</h3>
  {#if results}{results}{/if}
</div>
