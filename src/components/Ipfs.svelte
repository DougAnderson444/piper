<script>
  // svelte stuff
  import { onMount } from "svelte";
  import { fade, slide } from "svelte/transition";
  import QRCode from "./QRCode.svelte";

  //  for url/path/params/query: https://sapper.svelte.dev/docs#Argument
  import { stores } from "@sapper/app";
  const { page, session } = stores();

  //stores
  import {
    nodeId,
    nodeAgentVersion,
    nodeProtocolVersion,
    ipfsNode,
    start,
    root,
    rootHash,
    myProfile
  } from "./stores.js";

  import { createKeyPair, signMessage, verifySignature } from "./pkiHelper.js";
  import { savePeerToRoot, publish, subscr, ping, PING_TEXT } from "./utils.js";

  // IPFS
  import IPFS from "ipfs";
  import all from "it-all";

  // Profile object
  import Profile from "../utils/Profile.js";

  /* Alternatives, for auto-pinning
	const IPFS = require('ipfs-mini'); // https://github.com/SilentCicero/ipfs-mini
	const ipfs = new IPFS({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });
	// or
	const ipfsClient = require('ipfs-http-client')
	const ipfs = new ipfsClient({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });
	*/

  let addedFileContents,
    addedFileHash = "Pending...";
  const stringToUse = "hello world from webpacked IPFS. Love, Douglas.";

  let password = "";
  /*
	~/.ipfs/config only contains the identity key of the local IPFS node.
	{
	"Identity": {
		"PeerID": "Qmbjna...",
		"PrivKey": "RHwz3...",
		"pubKey": "CAASogEw..."
	},
	"Datastore": { ... 
	*/

  //defaults
  // https://sapper.svelte.dev/docs#Argument
  /*
	URL is /blog/some-post?foo=bar&baz, the following would be true:
		page.path === '/blog/some-post'
		page.params.slug === 'some-post'
		page.query.foo === 'bar'
		page.query.baz === true
	*/
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
    // from ipfs browser-webpack
    // name the repository, repository saved in the browser's IndexedDB
    // https://github.com/ipfs/js-ipfs/tree/master/packages/ipfs#ipfs-constructor

    const options = {
      repo: repo, // default is "ipfs", string or ipfs.Repo instance, file path at which to store the IPFS node’s data, String(Math.random() + Date.now())
      relay: {
        enabled: true,
        hop: {
          enabled: true
        }
      },      
      pass: password, //, // https://github.com/ipfs/js-ipfs/issues/1138
      libp2p: {
        config: {
          pubsub: {
            enabled: true
          }
        }
      },
      EXPERIMENTAL: { ipnsPubsub: true },
      init: {
        // only runs initially
        privateKey: privKey // (base64 PrivKey) string or full PeerId, A pre-generated private key to use. Can be either a base64 string or a PeerId instance.
      }
    };

    /*
     * START IPFS NODE
     */
    $ipfsNode = await IPFS.create(options);
    console.log(`ipfs node ready \n ${$ipfsNode}`);

    // /ip4/142.120.58.162/tcp/4003/ws/ipfs/QmRjDcnT5YBSg36Yzn5c4u63rkNTQyL2eGd5Ln3NvMTkzk
    //const multiaddr =  "/ip4/127.0.0.1/tcp/4003/ws/ipfs/QmRjDcnT5YBSg36Yzn5c4u63rkNTQyL2eGd5Ln3NvMTkzk"
    const multiaddr = "/dns4/super.peerpiper.io/tcp/4033/wss/ipfs/QmPFeUqE4x17gy6cV3bb9yjfiZvwPAtmwmt4zZqgnfEoz5";
    try{
      await $ipfsNode.swarm.connect(multiaddr)
      console.log(`Connected to ${multiaddr}`)
    }catch(e){
      console.log(e)
    }

    $start = new Date();

    const { id, agentVersion, protocolVersion } = await $ipfsNode.id();

    //copy to svelte stores
    $nodeId = id;
    $nodeAgentVersion = agentVersion;
    $nodeProtocolVersion = protocolVersion;

    //save as a whole file to IPFS
    /*
    for await (const { cid } of $ipfsNode.add(stringToUse)) {
      addedFileHash = cid.toString();

      //ipns --> Slow AF, unuseable
      //res = await $ipfsNode.name.publish( `/ipfs/${addedFileHash}`)
      //console.log(`IPNS pub ${res.value} to nodeId: https://gateway.ipfs.io/ipns/${res.name}`)

      let bufs = [];

      for await (const buf of $ipfsNode.cat(cid)) {
        bufs.push(buf);
      }

      const data = Buffer.concat(bufs);
      addedFileContents = data.toString("utf8");
  
    }
	  */

    //const pbLink = await $ipfsNode.dag.get("QmSnuWmxptJZdLJpKRarxBMS2Ju2oANVrgbr2xWbie9b2D")

    // example obj
    /*
    const obj = {
      a: 1,
      b: [1, 2, 3],
      c: {
        ca: [5, 6, 7],
        cb: "foo"
      }
      //,d: pbLink.value._links
	  };
	  */

    //const treeid = await $ipfsNode.dag.put(obj); //, { format: 'dag-cbor', hashAlg: 'sha2-256' }
    //console.log(`treeid is \n https://explore.ipld.io/#/explore/${treeid.toString()}`);
    // zdpuAmtur968yprkhG9N5Zxn6MFVoqAWBbhUAkNLJs2UtkTq5

    //const paths = await all($ipfsNode.dag.tree(treeid));
    ///console.log(`tree result is \n ${JSON.stringify(paths)}`)

    const config = await $ipfsNode.config.get();
    localStorage.setItem("peerId" + modifier, config.Identity.PrivKey);
    //console.log(`options.config`, config)
    //console.log(`config.Identity.PrivKey: \n`, config.Identity.PrivKey)  //PeerId PrivKey?

    // https://github.com/ipfs/js-ipfs/blob/447b44d1b64714f5ed0cafba166ad0a4dbbb587c/packages/ipfs/src/core/components/init.js
    /* 	config.Identity = {
				PeerID: peerId.toB58String(),
				PrivKey: peerId.privKey.bytes.toString('base64')
		*/

    const stats = await $ipfsNode.repo.stat();
    //console.log(`Repo stats: `,stats)

    //list all ipns myProfile
    //const myProfile = await $ipfsNode.key.list()
    //console.log(`List all myProfile: \n `, myProfile)

    //const pem = await $ipfsNode.key.export('self', password)   // key is for ipns
    //console.log(`pem is: \n `,pem)
  });

  // end onMount

  $: {
    if ($ipfsNode && $myProfile != 0) {
      subscr($ipfsNode, $myProfile.publicKey, receiveMsg);
    }
  }

  // returns content id (CID)
  async function getCID(data) {
    try {
      //console.log(`CID based on ${JSON.stringify(data)} ${JSON.stringify(data.toString())}`)
      const cidVal = await $ipfsNode.dag.put(data); //use DAG for object storage
      //console.log(`${JSON.stringify(data)} CID= ${JSON.stringify(cidVal.toString())}`)
      return cidVal;
    } catch (e) {
      return e;
    }
  }

  // what to do with the received
  const receiveMsg = msg => {
    // The `msg` has the format `{from: String, seqno: Buffer, data: Buffer, topicIDs: Array<String>}`

    if (msg.data.toString() == PING_TEXT) {
      console.log(`Ping replying with ${$rootHash}`);
      const msgString = String($rootHash); //String("hash for " + msg.topicIDs[0]); //JSON.stringify(msgObj)
      publish($ipfsNode, $myProfile, msgString); //respond using this profile's keypair, sign the response msg
    } else {
      console.log(`msg data: ${msg.data}`);
      const msgObj = JSON.parse(msg.data);
      const legit = verifySignature(msgObj.data, msgObj.sig, msg.topicIDs[0]);

      if (legit) {
        console.log(`LEGIT, save: ${JSON.stringify(msgObj.data)} `); //MC Hammer
        savePeerToRoot($root, msg.topicIDs[0], JSON.stringify(msgObj.data));
        $root = $root; // to update the store
      } else {
        console.log(`NOT LEGIT, QUIT: ${legit} `); //MC Hammer
      }
    }
  };
</script>

<style>
  div.outer {
    outline: 1px solid lightgray;
    padding: 15px;
  }
</style>

<div class="outer">
  {#if $nodeId}
    <div transition:slide={{ delay: 100, duration: 750 }}>
      <h2>Your node is running in the browser.</h2>
      <p>
        <b>
          View your data in web 3.0'land (kinda like a blockchain, but
          different):
        </b>
        <br />
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://explore.ipld.io/#/explore/{$rootHash}">
          {$rootHash}
        </a>
      </p>
      <QRCode value={`https://explore.ipld.io/#/explore/${$rootHash}`} />
      <p>Browser nodeID: {$nodeId}</p>
    </div>
  {:else}
    <div transition:slide={{ delay: 100, duration: 750 }}>
      <h2>Loading your peer node...</h2>
    </div>
  {/if}

</div>
