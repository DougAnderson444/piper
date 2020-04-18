<script>
  // add a peer ID to your contact list
  // by pasting Peer ID or [TODO] by scanning QR code for Peer Id
  import { slide } from "svelte/transition";
  import { root, myProfile, ipfsNode } from "./stores.js";
  import { savePeerToRoot, subscr, ping } from "./utils.js";
  import { verifySignature } from "./pkiHelper.js";
  
  const pingText = "Ping!";
  let peerID = "";

  const handleInput = async e => {
    // if peerID is 44 char long, then add it to the peer ID List
    if ((peerID + "").length == 53) {
      subscr($ipfsNode, peerID, receiveHandler).then(() => {
        ping($ipfsNode, peerID).then(() => {
          peerID = ""; //clear text input
        });
      });

      savePeerToRoot($root, peerID);
      $root = $root; //save it
    }
  };

  // what to do with the received
  const receiveHandler = msg => {
    // The `msg` has the format `{from: String, seqno: Buffer, data: Buffer, topicIDs: Array<String>}`

    if (msg.data.toString() != pingText) {
      console.log(`Add Peer ping respomse, msg data: ${msg.data}`);
      const msgObj = JSON.parse(msg.data);
      const legit = verifySignature(msgObj.data, msgObj.sig, msg.topicIDs[0]);

      if (legit) {
        savePeerToRoot($root, msg.topicIDs[0], msgObj.data);
        $root = $root; // to update the store
      } else {
        console.log(`NOT LEGIT, QUIT: ${legit} `); //MC Hammer
      }
    }
  };
</script>

<div>
  Add Peer:
  <input
    bind:value={peerID}
    on:input={handleInput}
    placeholder="Paste a Peer ID Here" />
  {peerID ? (peerID + '').length : ' -- '}
</div>
