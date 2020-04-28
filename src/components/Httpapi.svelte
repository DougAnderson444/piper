<script>
  // IPFS
  import IPFS from "ipfs";

  //  for url/path/params/query: https://sapper.svelte.dev/docs#Argument
  import { onMount } from "svelte";
  import { stores } from "@sapper/app";
  const { page, session } = stores();

  let privKey = null; // to load a known PeerId
  let modifier = ""; //Math.random() //"";
  let repo = "ipfs";
  if ($page.query.repo) {
    modifier = $page.query.repo;
    repo += modifier;
    console.log(`repo: ${repo}`);
  } else {
    // modifier = "-" + Math.floor(Math.random()*10000);
  }
  if (
    typeof window !== "undefined" &&
    localStorage.getItem("peerId" + modifier)
  ) {
    privKey = localStorage.getItem("peerId" + modifier);
  }

  onMount(async () => {
    /*
     * START IPFS NODE
     */

    const options = {
      repo: repo, // default is "ipfs", string or ipfs.Repo instance, file path at which to store the IPFS node’s data, String(Math.random() + Date.now())
      pass: "", //, // https://github.com/ipfs/js-ipfs/issues/1138
      init: {
        // only runs initially
        privateKey: privKey // (base64 PrivKey) string or full PeerId, A pre-generated private key to use. Can be either a base64 string or a PeerId instance.
      }
    };

    let node = await IPFS.create(options);
    console.log(`http-api ipfs node ready \n`);

    const multiaddr =
      "/dns4/super.peerpiper.io/tcp/4003/ws/ipfs/QmPFeUqE4x17gy6cV3bb9yjfiZvwPAtmwmt4zZqgnfEoz5";
    console.log(`Conect to remote Go node \n ${multiaddr}`);
    try {
      await node.swarm.connect(multiaddr);
    } catch (e) {
      console.log(e);
    }
  });
</script>
