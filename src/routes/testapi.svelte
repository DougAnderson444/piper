<script>
  import { onMount } from 'svelte'
  import ApiComp from '../components/Httpapi.svelte'
  import IpfsComp from '../components/Ipfs.svelte'
  import { ipfsNode } from '../components/stores.js'
  var Buffer = require('buffer/').Buffer // note: the trailing slash is important!

  import PouchDBAuthentication from 'pouchdb-authentication'
  import PouchDB from 'pouchdb'
  PouchDB.plugin(PouchDBAuthentication)

  //import {put,get, getInfo, getRemoteDBInfo, replicate} from "../utils/db.js";
  let info, rinfo
  var username = 'user891049' //"user" + Math.floor(Math.random() * 10000000);
  var localDB = new PouchDB('mypeerdb')
  var remoteDB = new PouchDB(
    `https://super.peerpiper.io:5999/userdb-${Buffer.from(username).toString(
      'hex',
    )}`,
    { skip_setup: true },
  ) // skip_setup is to prevent PouchDB from doing any HTTP requests to the server while we're not logged in

  let date
  let mounted = false

  onMount(async () => {
    mounted = true

    //create the user on the remote DB
    const pw = 'random_plaintext_password'
    const res = await fetch(
      `/api/createUser?username=${encodeURI(username)}&pw=${encodeURI(pw)}`,
      {
        credentials: 'include', // for cookies? TODO
      },
    )
    const resJson = await res.json()
    console.log(JSON.stringify(resJson, null, 2))
    if (resJson.error) {
      //error
      console.log(`Error ${JSON.stringify(resJson)}`)
    } else {
      let id = resJson.id // pouchDB response is "id":"org.couchdb.user:user3501306"
      username = id.substring(id.lastIndexOf(':') + 1) // trim the org.couchdb.user: from the front
      console.log(`User created: ${username}`)
    }

    //init the databases
    info = await localDB.info()
    rinfo = await remoteDB.info()

    var user = {
      name: username,
      password: pw,
    }
    var ajaxOpts = {
      ajax: {
        headers: {
          Authorization:
            'Basic ' + window.btoa(user.name + ':' + user.password),
        },
      },
    }

    // now try to write to this user's database
    remoteDB
      .logIn(username, 'random_plaintext_password', ajaxOpts)
      .then((response) => {
        console.log(JSON.stringify('response: ' + JSON.stringify(response)))
        if (!response.ok) {
          console.log('Not logged in ' + JSON.stringify(err, null, 2))
          if (err.name === 'unauthorized' || err.name === 'forbidden') {
            // name or password incorrect
          } else {
            // cosmic rays, a meteor, etc.
          }
        } else {
          console.log('Logged in ' + username)
        }
      })
      .then(async () => {
        rinfo = await remoteDB.info()
        console.log('remoteDB ' + JSON.stringify(rinfo,null,2))
      })

    localDB.sync(remoteDB, { live: true, retry: true }).on('error', () => {
      console.log('Error syncing dbs')
    })
  })
  $: {
    if ($ipfsNode && username) {
      console.log(`IPFS and user ready`)
      // make DNS link for this user
      let stringToUse = `DNS Link for ${username} is ${username}.peerpiper.io which points to this file.`
      ;(async () => {
        var addedFileHash
        /* Doesn't resolve...
        const cidVal = await $ipfsNode.dag.put({data: stringToUse}); //use DAG for object storage
        addedFileHash = cidVal.toString() //console.log(`${JSON.stringify(data)} CID= ${JSON.stringify()}`)
        //or
        for await (const { cid } of $ipfsNode.add(stringToUse)) {
          console.log(`cid is ${cid}`);
          addedFileHash = cid.toString();
          console.log(`addedFileHash is ${addedFileHash}`);
        }
        const dnsres = await fetch(
          `/api/dns?hash=${addedFileHash}&subdomain=${username}`
        );
        console.log(`hash is ${await dnsres.text()}`);
        */
      })()
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
User:
<br />
{username}
<br />
userdb-{Buffer.from(username).toString('hex')}
<hr />
{#if mounted}
  <IpfsComp />
{/if}
