<script>
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";

  // https://cweili.github.io/svelte-fa/
  //import Fa from "svelte-fa";
  //import { faFlag, faPlus, faCertificate, faUserCheck, faEllipsisH, faAngleUp, faQrcode, faCopy, faLink } from "@fortawesome/free-solid-svg-icons";
  import { myProfile } from "./stores.js";
  import Clipboard from "./Clipboard.svelte";

  //var QRCode = require('qrcode')
  import QRCode from "qrcode";

  let canvas;
  let visible = false;

  async function showQR() {
    QRCode.toCanvas(canvas, $myProfile.publicKey); // Draws qr code symbol to canvas.
    visible = !visible;
  }

</script>

<style>
  canvas {
    position: absolute;
    border: 1px solid black;
    z-index: 1;
  }
  span {
    display: inline-block;
  }

  .peerspan {
    border: 1px solid #aaa;
    padding: 1em;
    margin: 1em;
  }
</style>

{#if $myProfile}
  Connect using:
  <span class="peerspan">
    {$myProfile.url}
    <Clipboard value={$myProfile.url} />
  </span>
  <span
    on:mouseover={() => {
      showQR();
    }}>
    [QR Code]
  </span>
  <br />

  <canvas
    hidden={!visible}
    transition:fade
    on:mousemove={() => {
      visible = !visible;
    }}
    bind:this={canvas}
    width={32}
    height={32} />
  <br />
  <hr />
{/if}
