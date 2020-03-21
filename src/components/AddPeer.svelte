<script>
    // add a peer ID to your contact list
    // by pasting Peer ID or [TODO] by scanning QR code for Peer Id
    import { slide } from 'svelte/transition';

    let visible = false;
    let peerID = '';
    let checking = '';
    function checkIPFS(peerID){
        if(peerID.length == 44 && !checking){
            // check netowrk for this peerID
            checking = "checking..."
        }
    }
    const handleInput = (e) => {
        // if peerID is 44 char long, then add it to the peer ID List 
        if((peerID+'').length == 44) {
            addPeer(peerID)
        }
    };

    function addPeer(peerID){
        //pull contacts from IPFS storage and/or localStorage
        //push it onto the list of contacts
        contacts = [...contacts, peerID]

    }
</script>
<div>Add Peer: 
<input 
    bind:value={peerID} 
    on:input={handleInput}
    placeholder="Paste a Peer ID Here" >
{peerID ? (peerID+'').length : " -- "}
</div>