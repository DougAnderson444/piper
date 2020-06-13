<script>
  // test name.resolve(username.peerpiper.io) on the server
  import createIPFS, { resolve } from '../components/Ipfs.js'

  export let value, results, ipfsNode

  let url, res

  const handleSubmit = async () => {
    //if (ipfsNode) results = await resolve(ipfsNode, value) else results = 'Wait a moment, IPFS needs to finish loading'
    url = `https://cloudflare-dns.com/dns-query?name=${value}&type=TXT`
    res = await postData(url)
    results = res.Answer[0].data

    let strippedQuotes = results.replace(/['"]+/g, '')
    let ipnsHash = strippedQuotes.replace(/(^dnslink=\/ipns\/)/g, '')

    console.log(`ipnsHash: ${ipnsHash}`)
    try {
      for await (const name of ipfsNode.name.resolve(ipnsHash)) {
        console.log(name)
        let cidStr = name.replace(/^\/ipfs\//, '')
        console.log(`resolves to https://explore.ipld.io/#/explore/${cidStr}`)
        results += `
        resolves to https://explore.ipld.io/#/explore/${cidStr}`
      }
    } catch (err) {
      console.log(err)
    }
  }

  async function postData(url = '', data = {}) {
    const response = await fetch(url, {
      method: 'GET', // *GET, POST, PUT, DELETE, etc.
      headers: {
        accept: 'application/dns-json',
      },
    })
    return await response.json() // parses JSON response into native JavaScript objects
  }

  initIPFS()

  async function initIPFS() {
    console.log('IPFS Loading')
    ipfsNode = await createIPFS('username')
    console.log('IPFS Ready')
  }
</script>

<div>

  <form on:submit|preventDefault={handleSubmit}>
    <h2>Resolve a PeerPiper name</h2>

    <input type="text" placeholder="username.peerpiper.io" bind:value />

  </form>

  <br />

  <h3>Results</h3>
  {#if results}{results}{/if}
</div>
