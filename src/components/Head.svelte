<script>
    import { onMount } from 'svelte';
    import { fade } from 'svelte/transition';

    // https://cweili.github.io/svelte-fa/
	//import Fa from "svelte-fa";
    //import { faFlag, faPlus, faCertificate, faUserCheck, faEllipsisH, faAngleUp, faQrcode, faCopy, faLink } from "@fortawesome/free-solid-svg-icons";
    import { keys, rootHash } from './stores.js';
    import Clipboard from './Clipboard.svelte';

    //var QRCode = require('qrcode')
    import QRCode from 'qrcode'

    let canvas
    let visible = false;


    async function showQR(){
        QRCode.toCanvas(canvas, $keys.publicKey) // Draws qr code symbol to canvas.
        visible = !visible
    }
//on:mousemove={visible = !visible}
//    <AddPeer />
</script>
<style>
canvas {
    position: absolute;
    border: 1px solid black;
    z-index:1;
}
span {
    display: inline;
}

</style>
{#if $keys}
    <span>
        <Clipboard value={$keys.publicKey}/>
    </span>
    <br/>
        <span on:mouseover={()=>{showQR()}} >[Show Your Peer ID QR Code]</span>    
    <canvas hidden={!visible} transition:fade on:mousemove={()=>{visible = !visible}}
        bind:this={canvas}
        width={32}
        height={32}
    ></canvas>

{/if}