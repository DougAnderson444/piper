<script>
  // svelte stuff
  import { onMount } from "svelte";
  import { fade, slide } from "svelte/transition";

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
    myProfile,
    testProfiles
  } from "./stores.js";

  import { createKeyPair, signMessage, verifySignature } from "./pkiHelper.js";
  import { savePeerToRoot } from "./utils.js";
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
  const pingText = "Ping!";
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
  let modifier = "";
  let repo = "ipfs";
  if ($page.query.repo) {
    modifier = $page.query.repo;
    repo += modifier;
    console.log(`repo: ${repo}`);
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
      repo: "ipfs" + modifier, // default is "ipfs", string or ipfs.Repo instance, file path at which to store the IPFS node’s data, String(Math.random() + Date.now())
      pass: password, //, // https://github.com/ipfs/js-ipfs/issues/1138
      libp2p: {
        config: {
          pubsub: {
            enabled: true
          }
        }
      },
      EXPERIMENTAL: { ipnsPubsub: true }
      //init: {				// only runs initially
      //privateKey: privKey, // (base64 PrivKey) string or full PeerId, A pre-generated private key to use. Can be either a base64 string or a PeerId instance.
      //}
    };

    /*
     * START IPFS NODE
     */
    $ipfsNode = await IPFS.create(options);
    console.log(`ipfs node ready \n ${$ipfsNode}`)
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
    // test if signature with this private key matches the Public key from the peerid

    const stats = await $ipfsNode.repo.stat();
    //console.log(`Repo stats: `,stats)

    //list all ipns myProfile
    //const myProfile = await $ipfsNode.key.list()
    //console.log(`List all myProfile: \n `, myProfile)

    //const pem = await $ipfsNode.key.export('self', password)   // key is for ipns
    //console.log(`pem is: \n `,pem)

    /*
     * setup some test publicmyProfile, and pub responses
     * make a few public myProfile
     */
    for (let i = 0; i < 3; i++) {
      //str = str + i;
      const password = String(Math.random() + Date.now() + i);
      let temp = await new Profile(password);
      $testProfiles = [...$testProfiles, temp]; // copy to stores
      // listen for msgs
      subscr(temp, temp.publicKey).then(() => {
        // ping(temp.publicKey); // Ping
      });
    }
    $testProfiles = $testProfiles;
  });

  $: {
    if ($ipfsNode && $myProfile != 0) {
      //console.log(`$ipfsNode and myProfile= ${$myProfile} let's start listening`);
      subscr($myProfile, $myProfile.publicKey).then(() => {
        //console.log(`ipfs pinging $myProfile.publicKey ${$myProfile.publicKey}`);
        //ping($myProfile.publicKey);
      });
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

  function ping(topic) {
    $ipfsNode.pubsub.publish(topic, pingText);
  }

  async function publish(profile, msgString) {
    // publ a msg and sign with this profile's private key
    const msgSignature = signMessage(msgString, profile.privateKey); // sign the msg, so they know it's legit
    const msgObj = { data: msgString, sig: msgSignature };
    const msgConverted = JSON.stringify(msgObj)
    
    try {
      let res = await $ipfsNode.pubsub.publish(
        profile.publicKey,
        msgConverted
      ); 
      console.log(
        `Successfull published ${msgString} from ${profile.publicKey}!`
      );
      return res;
    } catch (err) {
      console.log("Error publishing, ", err);
      return new Error(err); //throw
    }
  }

  // profile listens for topic
  async function subscr(profile, topic) {
    // what to do with the received
    const receiveMsg = msg => {
      // The `msg` has the format `{from: String, seqno: Buffer, data: Buffer, topicIDs: Array<String>}`
      
      if (msg.data.toString() == pingText) {
        // respond to ping
        const msgString = String("hash for " + msg.topicIDs[0]); //JSON.stringify(msgObj)
        publish(profile, msgString);
      } else {
        console.log(`msg data: ${msg.data}`)
        const msgObj = JSON.parse(msg.data);
        const legit = verifySignature(msgObj.data, msgObj.sig, msg.topicIDs[0]);

        if (legit) {
          savePeerToRoot($root, msg.topicIDs[0], msgObj.data)
          $root = $root; // to update the store
        } else {
          console.log(`NOT LEGIT, QUIT: ${legit} `); //MC Hammer
        }
      }
    };

    try {
      let res = await $ipfsNode.pubsub.subscribe(topic, receiveMsg); // return a promise
      //console.log(`Successfull subsc'd to ${topic}! res; ${res} `);
      return res;
    } catch (err) {
      console.log("Error subsc'ing, ", err);
      return new Error(err); //throw
    }
  }
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
      <!--p>Your browser server ID is: <strong>{$nodeId}</strong></p>
		<hr />
	</div>
	<div-->
      Your current DAG roothash is:
      <br />
      <a
        target="_blank"
        rel="noopener noreferrer"
        href="https://explore.ipld.io/#/explore/{$rootHash}">
        {$rootHash}
      </a>
      <br />
    </div>
  {:else}
    <div transition:slide={{ delay: 100, duration: 750 }}>
      <h2>Loading your peer node...</h2>
    </div>
  {/if}

</div>
