<script>
  import { onMount } from "svelte";
  import IpfsComp from "../components/Ipfs.svelte";
  import UserInterface from "../components/UserInterface.svelte";
  import {
    myProfile,
    ipfsNode,
    portfolio,
    rootHash
  } from "../components/stores.js";
  import Profile from "../utils/Profile.js";

  //  for url/path/params/query: https://sapper.svelte.dev/docs#Argument
  import { stores } from "@sapper/app";
  const { page, session } = stores();

  onMount(async () => {
    if (typeof window !== "undefined" && localStorage.getItem("myProfile") ) {
      $myProfile = localStorage.getItem("myProfile", JSON.parse($myProfile));
    } else {
      const password = String("password 1 2... " + Math.random() + Date.now());
      console.log(`Profile password is: ${password}`)
      $myProfile = await new Profile(password, $rootHash);
      localStorage.setItem("myProfile", JSON.stringify($myProfile));
    }
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
  h1 {
    font-size: 48px;
  }
  .title {
    margin: 0;
    width: 100%;
    padding-top: 20px;
    line-height: 1.15;
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
  <title>PeerPiper.io - Save once, Sync with Many with one click</title>
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
    <h2 class="title">
      Getting data from the people who have it, to the people who need it.
    </h2>
  </center>
  <p class="description">
    Save your data in one spot, then pipe out to your selected peers groups
    unlimited times.
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
