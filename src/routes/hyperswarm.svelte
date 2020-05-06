<script>
  // https://packd.now.sh/hyperswarm@2.13.0
  
  let status = false;
  
  /*
  const hyperswarm = require('hyperswarm')
  import { onMount } from "svelte";


  onMount(() => {
    const swarm = hyperswarm();
    status = true
  });
  //import forge from 'node-forge'
  /*
    // look for peers listed under this topic
    var md = forge.sha256.create(); // md = message digest, aka hash
    md.update('my-hyperswarm-topic', 'utf8');
    var topic = md.digest().getBytes();


    swarm.join(topic, {
        lookup: true, // find & connect to peers
        announce: true // optional- announce self as a connection target
    })

    status = "Joining swarm "+ topic

    swarm.on('connection', (socket, details) => {
        console.log('new connection!', details)
        status = "Connected to "+ topic + "!"

        // you can now use the socket as a stream, eg:
        // process.stdin.pipe(socket).pipe(process.stdout)
    })
    */
</script>

{#if status}{status}{/if}
