<script>
  import { onMount } from "svelte";
  import ApiComp from "../components/Httpapi.svelte";
  import IpfsComp from "../components/Ipfs.svelte";
  import { ipfsNode } from "../components/stores.js";

  import PouchDBAuthentication from "pouchdb-authentication";
  import PouchDB from "pouchdb";
  PouchDB.plugin(PouchDBAuthentication);

  //the pouchdb-authentication API will operate on your remote PouchDB object, not your local one.

  //import {put,get, getInfo, getRemoteDBInfo, replicate} from "../utils/db.js";
  let info, rinfo;
  var localDB = new PouchDB("mypeerdb");
  var remoteDB = new PouchDB("https://super.peerpiper.io:5999/peers");
  let date;
  let username;
  onMount(async () => {
    //init the databases
    info = await localDB.info();
    rinfo = await remoteDB.info();

    //create the user on the remote DB
    const pw = "random_plaintext_password";
    const res = await fetch(`/api/createUser?pw=${pw}`, {
      credentials: "include" // for cookies? TODO
    });
    const resText = await res.text();
    console.log(resText);
    date = resText;
    let id = JSON.parse(resText).id;
    username = id.substring(id.lastIndexOf(":") + 1);
    console.log(username);

    // now try to write to this user's database
    remoteDB.logIn(username, "random_plaintext_password", function(
      err,
      response
    ) {
      if (err) {
        console.log(err);
        if (err.name === "unauthorized" || err.name === "forbidden") {
          // name or password incorrect
        } else {
          // cosmic rays, a meteor, etc.
        }
      } else {
        console.log("Logged in " + username);
      }
    });
  });
  $: {
    if ($ipfsNode && username) {
      console.log(`IPFS and user ready`);
      // make DNS link for this user
      let stringToUse = `DNS Link for ${username} is ${username}.peerpiper.io which points to this file.`;
      (async () => {
        var addedFileHash;
        for await (const { cid } of $ipfsNode.add(stringToUse)) {
          console.log(`cid is ${cid}`);
          addedFileHash = cid.toString();
          console.log(`addedFileHash is ${addedFileHash}`);
        }
        const dnsres = await fetch(
          `/api/dns?hash=${addedFileHash}&subdomain=${username}`
        );
        console.log(`hash is ${await dnsres.text()}`);
      })();
    }
  }
</script>

<!-- ApiComp /-->

{#await info}
  <p>Waiting for PouchDb...</p>
{:then i}
  <p>PouchDb Info:</p>
  {JSON.stringify(i, null, 2)}
{:catch err}
  Sorry, {err}
{/await}

<p>
  {#await rinfo}
    <p>Waiting for Remote CouchDb...</p>
  {:then r}
    <p>CouchDb Info:</p>
    {JSON.stringify(r, null, 2)}
  {:catch err}
    Sorry, {err}
  {/await}

</p>
Date:
<br />
{date}
<br />
{username}
<hr />
<IpfsComp />
