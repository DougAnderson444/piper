<script>

	import IpfsComp from '../components/Ipfs.svelte'

</script>
<style>
     .hero {
        margin: 3rem 1rem;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
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
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";

      }
</style>
<svelte:head>
	<title>PeerPiper.io - Save once, Pipe to Peers anytime</title>
</svelte:head>

<div class="hero">
	<center>
		<img alt="the big P for PeerPiper.io" width="150" height="150" layout="fixed" class="logo" src="P.png" />
		<h1 class="title">PeerPiper.io</h1>
	</center>
	<p class="description"> 
		Your ultimate personal data sink. Save once, pipe out to your selected peer groups.
	</p>
</div>

<IpfsComp/>
