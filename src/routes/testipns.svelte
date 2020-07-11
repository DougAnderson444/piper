<script>
  import { onMount } from 'svelte'
  import { getKeyPairFromSeed } from 'human-crypto-keys'
  const pRetry = require('p-retry')
  const base64url = require('base64url')
  const ipns = require('ipns')
  const delay = require('delay')
  const last = require('it-last')
  var toBuffer = require('typedarray-to-buffer')

  //stores
  import { elapsed, start } from '../components/stores.js'

  import buffer from 'buffer'
  const Buffer = buffer.Buffer

  import createIPFS, {
    getIndexHash,
    fromB58String,
    multiAddress,
  } from '../components/Ipfs.js'

  import ipfsHttp from 'ipfs-http-client'
  const ipfsAPI = ipfsHttp('/dns4/super.peerpiper.io/tcp/5001')

  const goPeerId = 'QmPFeUqE4x17gy6cV3bb9yjfiZvwPAtmwmt4zZqgnfEoz5'
  const multiaddr = `/dns4/super.peerpiper.io/tcp/4033/wss/ipfs/${goPeerId}`

  const KEY_NAME = 'self' // 'myKey'

  export let topics, state, subs, ipfsNode, browser, server
  let timerId, timer, jsPeer, goPeer

  const ipfsRef = `/ipfs/QmWCnkCXYYPP7NgH6ZHQiQxw7LJAMjnAySdoz9i1oxD5XJ` // Doug's random IPFS file for testing IPNS.  https://ipfs.ink/e/QmWCnkCXYYPP7NgH6ZHQiQxw7LJAMjnAySdoz9i1oxD5XJ

  // curl --data "stream=false&arg=QmUXmfYBBN443QqYjicMkK8F83pahB2qhRVDW3kvM1wivP" http://super.peerpiper.io:5001/api/v0/name/resolve | json_pp

  const retryOptions = {
    retries: 5,
  }

  const checkWS = async () => {
    const peerInfos = await ipfsNode.swarm.addrs()
    let found = false
    peerInfos.forEach((info) => {
      if (info.id == goPeerId || info.addrs.toString() == multiaddr) {
        /*browser += `<br/>${new Date(
          Date.now(),
        ).toLocaleString()} nodeJS connected to nodeGo`
        */
        found = true
        browser += `<br/>${new Date(
          Date.now(),
        ).toLocaleString()} nodeJS connected to nodeGo`
      }
    })
    if (!found) {
      browser += `<br/>${new Date(
        Date.now(),
      ).toLocaleString()} nodeJS NOT connected to nodeGo`
      await ipfsNode.swarm.connect(multiaddr)
    }

    timerId = setTimeout(checkWS, 5000)
  }

  const connectPeers = async () => {
    // check server peers
    let goPeers = await ipfsAPI.swarm.peers()
    let found
    goPeers.find((p) => {
      if (p.peer == jsPeer.id) {
        server += `<br/>${new Date(
          Date.now(),
        ).toLocaleString()} nodeGo connected to ${jsPeer.id}`
        found = true
      }
    })
    if (!found) {
      server += `<br/>${new Date(
        Date.now(),
      ).toLocaleString()} nodeGo NOT connected to ${
        jsPeer.id
      }, retry\n${multiaddr}`
      try {
        await ipfsNode.swarm.disconnect(multiAddress)
      } catch (error) {
        console.log(`Disconnect failed: ${error}`)
      }
      server += `<br/>${new Date(
        Date.now(),
      ).toLocaleString()} wait 10 seconds before trying to reconnect`
      await delay(10000) // wait 10 seconds before trying to reconnect
      try {
        // reconnect and republish
        await ipfsNode.swarm.connect(multiaddr)
        //const res1 = await ipfsNode.name.publish(ipfsRef, {resolve: false})
        //console.log(`Re-Published ${(await ipfsNode.id()).id}`, res1)
      } catch (error) {
        console.log(`Retry failed: ${error}`)
      }
    }
    timer = setTimeout(connectPeers, 5000)
  }

  onMount(async () => {
    ipfsNode = await createIPFS('username')
    jsPeer = await ipfsNode.id()
    goPeer = await ipfsAPI.id()

    connectPeers()
    checkWS()

    console.log(`Initial Resolve...`)
    last(ipfsAPI.name.resolve(jsPeer.id, { stream: false }))
    await delay(1000)

    await subscribeToReceiveByPubsub(
      ipfsAPI,
      ipfsNode,
      goPeer.id,
      jsPeer.id,
      'self',
    )
    /*
    await subscribeToReceiveByPubsub(
      ipfsAPI,
      ipfsNode,
      idGo,
      publicKeyJs,
      KEY_NAME,
    )
    */
  })

  //  * IPNS resolve subscription test
  //  * 1) name.resolve() , which subscribes the topic
  //  * 2) wait to guarantee the subscription
  //  * 3) subscribe again just to know until when to wait (inside the scope of the test)
  //  * 4) wait for the other peer to get notified of the subscription
  //  * 5) publish new ipns record
  //  * 6) wait until the record is received in the test scope subscribe
  //  * 7) resolve ipns record
  const subscribeToReceiveByPubsub = async (
    nodeGo,
    nodeJs,
    idGo,
    publicKeyJs,
    keyName,
  ) => {
    const namespace = '/record/'

    let subscribed = false
    function checkMessage(msg) {
      subscribed = true
      console.log(`subscribed: `, subscribed)
      const from = msg.from
      const seqno = msg.seqno.toString('hex')

      server += `<br/>${new Date(
        Date.now(),
      ).toLocaleString()} \n Message ${seqno} from ${from}:`

      let regex = '/record/'
      if (
        msg.topicIDs[0].toString().match(regex)
          ? msg.topicIDs[0].toString().match(regex).length > 0
          : false
      ) {
        server +=
          `<br/>${ipns.unmarshal(msg.data).sequence.toString()}. Topic: ` +
          msg.topicIDs[0].toString()
        server += `<br/>Value: ` + ipns.unmarshal(msg.data).value.toString()
      } else {
        server += `<br/>Topic ${msg.topicIDs[0]}`
        server += `<br/>Regular Msg: ` + msg.data.toString()
      }
    }
    function checkMessages(msg) {
      const from = msg.from
      const seqno = msg.seqno.toString('hex')

      browser += `<br/>Message ${seqno} from ${from}:`

      let regex = '/record/'
      if (
        msg.topicIDs[0].toString().match(regex)
          ? msg.topicIDs[0].toString().match(regex).length > 0
          : false
      ) {
        browser +=
          `<br/>${ipns.unmarshal(msg.data).sequence.toString()}. Topic: ` +
          msg.topicIDs[0].toString()
        browser += `<br/>Value: ` + ipns.unmarshal(msg.data).value.toString()
      } else {
        browser += `<br/>Topic ${msg.topicIDs[0]}`
        browser += `<br/>Regular Msg: ` + msg.data.toString()
      }
    }

    let b58 = await fromB58String(publicKeyJs)
    const keys = ipns.getIdKeys(b58)
    const topic = `${namespace}${base64url.encode(keys.routingKey.toBuffer())}`

    await nodeJs.pubsub.subscribe(topic, checkMessages) // subscribed?

    /*
    try {
      await nodeGo.pubsub.unsubscribe(topic)
    } catch (error) {
      console.log(error)
    }
    */
    //console.log(`Subscribe to topic: `, topic)
    await nodeGo.pubsub.subscribe(topic, checkMessage) // subscribed?

    await waitForPeerToSubscribe(nodeGo, topic) // confirm topic is on THEIR list  // API
    await waitForNotificationOfSubscription(nodeJs, topic, idGo) // confirm they are on OUR list

    const res1 = await nodeJs.name.publish(ipfsRef, {
      resolve: false,
    })
    console.log(`Published to ${keyName}`, res1)
    console.log(`try CLI:\nipfs name resolve ${publicKeyJs}`)

    /*
    console.log(`Wait for subscribed...`)
    $start = new Date()
    await waitFor(() => {
      nodeJs.name.publish(ipfsRef, {
        resolve: false,
      })
      return subscribed === true
    }, 30 * 1000)
    */

    console.log(`Post-publish Resolve...`)
    const res2 = await last(nodeGo.name.resolve(publicKeyJs, { stream: false }))
    console.log(`${res2} == \n${ipfsRef}`, res2 == ipfsRef)

    let r = await nodeJs.name.publish(ipfsRef, {
      resolve: false,
    })
    console.log(`Published again (sends another pubsub message`, r)

    console.log(`Wait 10 seconds resolve...`)
    $start = new Date()
    await delay(10000)

    console.log(`Resolve on nodeGo, again \n ${publicKeyJs} `)
    const res3 = await last(nodeGo.name.resolve(publicKeyJs, { stream: false }))

    console.log(`${res3} == \n${ipfsRef}`, res3 == ipfsRef)
  }

  // wait until a peer know about other peer to subscribe a topic
  const waitForNotificationOfSubscription = (daemon, topic, peerId) =>
    pRetry(async () => {
      const res = await daemon.pubsub.peers(topic)

      if (!res || !res.length || !res.includes(peerId)) {
        throw new Error('Could not find peer subscribing')
      }
    }, retryOptions)

  // Wait until a peer subscribes a topic
  const waitForPeerToSubscribe = async (daemon, topic) => {
    await pRetry(async () => {
      const res = await daemon.pubsub.ls()

      if (!res || !res.length || !res.includes(topic)) {
        throw new Error('Could not find subscription')
      }

      return res[0]
    }, retryOptions)
  }

  const waitFor = async (predicate, ttl = 10000, checkInterval = 50) => {
    const timeout = Date.now() + ttl

    while (true) {
      if (predicate()) {
        return
      }

      await delay(checkInterval)

      if (Date.now() > timeout) {
        throw new Error('waitFor time expired')
      }
    }
  }

  /*
    let remList = await nodeGo.pubsub.ls() // API
    console.log(`Remote Pubsub.List: `, remList) // API

    let remListSubs = await nodeGo.name.pubsub.subs() // API
    console.log(`Remote Name.Pubsub.subs: `, remListSubs)

*/
</script>

<style>
  .container {
    display: flex; /* or inline-flex */
    flex-direction: row;
    justify-content: space-around;
    align-items: flex-start;
    border: 1px solid grey;
    width: auto;
    font-size: 0.5em;
  }
  .item {
    flex-grow: 1;
    border: 1px solid green;
    margin: 1em;
    padding: 1em;
    width: auto;
  }
</style>

<div class="container">
  <div class="item">
    Browser
    <br />
    {@html browser}
  </div>
  <div class="item">
    Server
    <br />
    {$elapsed}
    <br />
    {@html server}
  </div>
</div>

{#if topics}
  {#await topics then t}
    <p>
      {#each t as topic}
        {topic}
        <br />
      {/each}
    </p>

  {/await}
{/if}

{#if state}
  {#await state then s}
    <p>Pubsub enabled? {s.enabled}</p>
  {/await}
{/if}

{#if subs}
  {#await subs then s}
    <p>
      {#each s as sub}
        {sub}
        <br />
      {/each}
    </p>
  {/await}
{/if}
