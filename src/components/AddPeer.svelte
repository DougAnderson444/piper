<script>
  // add a peer ID to your contact list
  // by pasting Peer ID or [TODO] by scanning QR code for Peer Id
  import { slide } from "svelte/transition";
  import { root } from "./stores.js";

  let peerID = "";

  const handleInput = async e => {
    // if peerID is 44 char long, then add it to the peer ID List
    if ((peerID + "").length == 44) {
      // save the new object back to root
      if (!$root.hasOwnProperty("UUIDs")) $root["UUIDs"] = {};

      $root = $root; //save it

      if (!$root["UUIDs"].hasOwnProperty(peerID)) {
        $root["UUIDs"][peerID] = {};
      }

      $root = $root; //save it

      peerID = ""; //clear text input)
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
