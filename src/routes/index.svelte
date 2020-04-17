<script>
  import { onMount } from "svelte";
  import IpfsComp from "../components/Ipfs.svelte";
  import UserInterface from "../components/UserInterface.svelte";
  import { myProfile, ipfsNode, portfolio } from "../components/stores.js";
  import Profile from "../utils/Profile.js";

  //  for url/path/params/query: https://sapper.svelte.dev/docs#Argument
  import { stores } from "@sapper/app";
  const { page, session } = stores();

  onMount(async () => {
    const password = "my super secret pass phrase that nobody will ever guess";
    $myProfile = await new Profile(password);
    console.log(`profile created: ${JSON.stringify($myProfile.publicKey)}`);
  });
</script>

<style>
  .hero {
    margin: 3rem 1rem;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
      Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji",
      "Segoe UI Symbol";
    color: #525252;
    width: 100%;
  }
  .title {
    margin: 0;
    width: 100%;
    padding-top: 20px;
    line-height: 1.15;
    font-size: 48px;
    font-weight: bold;
  }
  .description {
    text-align: center;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
      Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji",
      "Segoe UI Symbol";
  }
</style>

<svelte:head>
  <title>PeerPiper.io - Save once, Pipe to Peers anytime</title>
  <link
    rel="stylesheet"
    href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css" />
</svelte:head>

<div class="hero">
  <center>
    <img
      alt="the big P for PeerPiper.io"
      width="150"
      height="150"
      layout="fixed"
      class="logo"
      src="P.png" />
    <h1 class="title">PeerPiper.io</h1>
  </center>
  <p class="description">
    Your ultimate personal data sink. Save once, pipe out to your selected peer
    groups.
    <br />
    Connect with friends and businesses to automagically sync data for easier
    life and better christmas gifts.
    <br />
    It's like being continuously registered for gifts with every business you
    meet.
  </p>
</div>

<IpfsComp />
<br />
<br />
{#if $ipfsNode}
  <UserInterface />
{:else}Loading node...{/if}

<!-- page.path 
{#if page.query}
  <p>Query is: {page.query}</p>
{/if}

<p>Query is: {JSON.stringify($page.query)}</p>
<p>Query is: {JSON.stringify($page.query.user)}</p>
-->