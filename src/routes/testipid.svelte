<script>
  import { onMount } from "svelte";
  import IpfsComp from "../components/Ipfs.svelte";
  import { ipfsNode } from "../components/stores.js";
  import createIpid, { getDid } from "did-ipid";
  import { jwk2pem } from "pem-jwk";
  import IPFS from "ipfs";

  let mounted = false;
  let ipid, peerId;
  var pem;

  let repo = "ipfs-" + Math.floor(Math.random() * Math.floor(1048575));

  // For when I can crypto.keys.import/export Ed25519 keys
  async function testEd25519() {
    let start = Date.now();
    console.log(`Start ${start}`);
    var tld = "tld";
    var username = "username";
    let password, salt, iterations, keySize, hash;
    password = "password";
    salt = `${tld}${username}`;
    iterations = 10000;
    keySize = 32;
    hash = "sha2-256";
    var derivedKey = IPFS.crypto.pbkdf2(
      password,
      salt,
      iterations,
      keySize,
      hash
    );

    const bits = 256;
    // seed is a 32 byte uint8array
    var buf = Buffer.from(derivedKey, "utf8");
    var seed = await IPFS.multihashing.digest(buf, "sha2-256");
    //var decoded = IPFS.multihash.decode(encoded).digest
    console.log(`IPFS Seed: \n${seed.toString("base64")}\n`);

    var ed25519PrivateKey = await IPFS.crypto.keys.generateKeyPairFromSeed(
      "ed25519",
      seed,
      bits
    ); // returns Ed25519PrivateKey
    var b64pk = Buffer.from(ed25519PrivateKey.bytes).toString("base64");
    console.log("mockEd25519PrivateKey: \n" + b64pk);

    IPFS.PeerId.createFromPrivKey(Buffer.from(b64pk, "base64")).then(id => {
      console.log(`\n1.PeerId from password/seed: \n${id.toB58String()} \n `);
    });
    const peerId = await IPFS.PeerId.createFromPrivKey(ed25519PrivateKey.bytes);
    //.then(peerId => {
    console.log(
      `\n2.PeerId from password/seed: \n${peerId.toB58String()}  \n `
    );
    //});

    console.log(`End ${Date.now() - start} ms`);

    let options = {
      repo: repo, // default is "ipfs", string or ipfs.Repo instance, file path at which to store the IPFS node’s data
      init: {
        privateKey: peerId
      },
      pass: seed.toString("base64") //"01234567890123456789" // https://github.com/ipfs/js-ipfs/issues/1891
    };

    console.log(`peerid.privKey`, peerId.privKey);
    try {
      const node = await IPFS.create(options);

      await node.start();
      await node.stop();
    } catch (err) {
      console.log(err);
    }
  }

  onMount(async () => {
    mounted = true;
    console.log("mounted");

    peerId = await IPFS.PeerId.create({ bits: 2048, keyType: "rsa" }); // create PeerId
    let jwk = peerId.privKey._key; 
    pem = jwk2pem(jwk); // RSA-pem required for keychain

    //testEd25519();

    /*
        (async function() {
      const peerId = await IPFS.PeerId.create({
        bits: 256,
        keyType: "ed25519"
      });
      const node = await IPFS.create({
        repo: repo,
        init: {
          privateKey: peerId
        },
        pass: "01234567890123456789" //seed.toString("base64") //
      });

      await node.start();
      //await node.stop();

      const value = 'QmSnuWmxptJZdLJpKRarxBMS2Ju2oANVrgbr2xWbie9b2D'

      const options = {
        resolve: false,
        lifetime: '1m',
        ttl: '10s',
        key: 'self',
        allowOffline: true
      }

      const res = await node.name.publish(value, options)
      console.log(res)
      console.log(res.name)
      console.log(res.value)

    })();

    */
  });

  $: {
    if ($ipfsNode) {
      let keysList;
      (async () => {
        console.log(`try keylist`);

        try {
          keysList = await $ipfsNode.key.list();
          console.log(keysList);
        } catch (err) {
          console.log(err);
        }
      })();
      if ($ipfsNode != 0 && keysList != 0) {
        onReady();
      }
    }
  }

  const onReady = async () => {
    //on.ready
    ipid = await createIpid($ipfsNode);
    console.log("IPID ready");

    //=> Creates a new DID and the corresponding DID Document based on the provided private key pem.
    //=> The DID Document is published with the added publicKey, authentication and service.
    const didDocument = await ipid.create(pem, document => {
      const publicKey = document.addPublicKey({
        type: "RsaVerificationKey2018",
        publicKeyHex:
          "02b97c30de767f084ce3080168ee293053ba33b235d7116a3263d29f1450936b71"
      });

      const authentication = document.addAuthentication(publicKey.id);

      const service = document.addService({
        id: "hub",
        type: "HubService",
        serviceEndpoint: "https://hub.peerpiper.io/"
      });
    });

    console.log(`DID Doc published to ${peerId.toJSON().id}`);
    try {
      for await (const name of $ipfsNode.name.resolve(peerId.toJSON().id)) {
        console.log(name);
        // /ipfs/QmQrX8hka2BtNHa8N8arAq16TCVx5qHcb46c5yPewRycLm
        console.log(`resolves to https://explore.ipld.io/#/explore/${name}`);
      }
    } catch (err) {
      console.log(err);
    }
  };

</script>

{#if mounted}
  
  <IpfsComp />
  
{/if}
