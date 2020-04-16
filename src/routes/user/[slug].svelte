<script context="module">
  // IPFS
  import IPFS from "ipfs";
	let ipfsNode

  export async function preload({ params, query }) {
    // the `slug` parameter is available because
    // this file is called [slug].svelte
    // const res = await this.fetch(`blog/${params.slug}.json`);

    ipfsNode = await IPFS.create({ repo: String(Math.random() + Date.now()) });
	// get the list data
	//getData()

	await ipfsNode.stop()

    const res = await fetch(
      "https://ipfs.io/ipfs/QmRzuXszugMQNgAvi2oGpEKBuNbAWV9yxruxTK4drNR7hh"
    );
    const data = await res.json();

    console.log("data", data);
    console.log("slug", params.slug);
    console.log("[slug]", data[params.slug]);

    if (res.status === 200) {
      return { post: data[params.slug] };
    } else {
      this.error(res.status, data.message);
    }
  }

  
	async function subscribe(){
		console.log(`subscribing to ${topic}`)
		try{
			return await ipfsNode.pubsub.subscribe(topic, receiveMsg)  // return a promise
		}catch{
			return new Error("error"); //throw 
		}
	}
</script>

<script>
  export let post;
</script>

<style>
  /*
		By default, CSS is locally scoped to the component,
		and any unused styles are dead-code-eliminated.
		In this page, Svelte can't know which elements are
		going to appear inside the {{{post.html}}} block,
		so we have to use the :global(...) modifier to target
		all elements inside .content
	*/
  .content :global(h2) {
    font-size: 1.4em;
    font-weight: 500;
  }

  .content :global(pre) {
    background-color: #f9f9f9;
    box-shadow: inset 1px 1px 5px rgba(0, 0, 0, 0.05);
    padding: 0.5em;
    border-radius: 2px;
    overflow-x: auto;
  }

  .content :global(pre) :global(code) {
    background-color: transparent;
    padding: 0;
  }

  .content :global(ul) {
    line-height: 1.5;
  }

  .content :global(li) {
    margin: 0 0 0.5em 0;
  }
</style>

<svelte:head>
  <title>{post}</title>
</svelte:head>

<h1>{post}</h1>

<div class="content">
  {@html post}
</div>
