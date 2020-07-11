<script>
  import IpfsComp from '../components/Ipfs.svelte'
  import {
    getHash,
    encrypt,
    saveToIPFS,
    getIndexHash,
    encryptSaveToIPFS,
    importIPFSFolderToMFS,
  } from '../components/Ipfs.js'
  import { ipfsNode } from '../components/stores.js'

  export let directoryStatus, cid, iv

  const run = async () => {
    let addedFileHash

    const filePath = '/private/'
    const fileName = 'myfile.json'
    let myJson = { contacts: 'Some initial data here' }
    const myFiles = [
      {
        path: `${filePath}${fileName}`,
        content: JSON.stringify(myJson),
      },
    ]

    directoryStatus = await $ipfsNode.files.stat('/')
    console.log(`directoryStatus: `, directoryStatus)

    if (
      directoryStatus.cumulativeSize == 4 || //size of empty dir
      directoryStatus.cid == 'QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn' // Hash of empty directory
    ) {
      //empty, fill it with data
      console.log('empty, fill it with data')
      await $ipfsNode.files.mkdir('/private', { parents: true })
      await $ipfsNode.files.mkdir('/public', { parents: true })

      for await (const result of $ipfsNode.add(myFiles, {
        wrapWithDirectory: true,
      })) {
        console.log(`addedFileHash: `, result)
        addedFileHash = result.cid.toString()
      }
    } else {
      // not empty
      console.log('not empty')
    }
    console.log(`addedFileHash: `, addedFileHash, `filePath`, filePath)

    await importIPFSFolderToMFS($ipfsNode, addedFileHash, filePath)

    // Add more data
    await $ipfsNode.files.write(
      '/public/hello-world',
      Buffer.from('Hello, world!'),
      {
        create: true,
        parents: true,
      },
    )

    const chunks = []

    for await (const chunk of $ipfsNode.files.read(
      `${filePath}${fileName}`,
    )) {
      chunks.push(chunk)
    }

    console.log(`chunk reads: `, Buffer.concat(chunks).toString())

    //encrypt using hash as key
    let path = `${filePath}encrypted-file`
    let decryptedMessage = Buffer.concat(chunks).toString()
    let username = 'username'
    let password = 'password'

    let index = 1 // TODO getIndex()
    let key = await getIndexHash(username, password, index)

    // TODO getIV(); saveIV()
    iv = 'AwwwwwwesomeInitializationVector' // has to be 32 bytes long though
    const IV_LENGTH = 32
    iv = iv.substring(0, IV_LENGTH) // if it's too long
    iv = iv.padEnd(IV_LENGTH, '=') // if it's too short, pad the end

    let encryptedBuffer = await encrypt(key, iv, decryptedMessage)
    await saveToIPFS($ipfsNode, path, encryptedBuffer)
    cid = await $ipfsNode.files.flush('/')

    directoryStatus = await $ipfsNode.files.stat('/')
    console.log(`new directoryStatus: `, directoryStatus)
  }

  // if files.stat is empty

  const checkIPFS = () => {
    console.log('Checking IPFS')
    if ($ipfsNode && $ipfsNode.isOnline()) {
      console.log('IPFS online')
      clearInterval(tryIPFS)
      run()
    }
  }

  let tryIPFS = setInterval(checkIPFS, 750)
</script>

<IpfsComp />

{#if directoryStatus}
  <br />
  'directoryStatus:',
  <a
    target="_blank"
    href="https://explore.ipld.io/#/explore/{directoryStatus.cid.toString()}">
    {directoryStatus.cid.toString()}
  </a>
{/if}
<br />
{#if cid}
  'cid:',
  <a target="_blank" href="https://ipfs.io/ipfs/{cid.toString()}">
    {cid.toString()}
  </a>
{/if}
