<script>
    // add a peer ID to your contact list
    // by pasting Peer ID or [TODO] by scanning QR code for Peer Id
    import { slide } from 'svelte/transition';
	import { ipfsNode, rootHash, portfolio } from './stores.js'

    let visible = false;
    let peerID = '';
    let checking = '';
    function checkIPFS(peerID){
        if(peerID.length == 44 && !checking){
            // check netowrk for this peerID
            checking = "checking..."
        }
    }
    const handleInput = async(e) => {
        // if peerID is 44 char long, then add it to the peer ID List 
        if((peerID+'').length == 3) {

            $portfolio.forEach((segment, index)=>{ 
                if(segment.key == "uuids"){
                    let set = new Set(segment.value);
                    const initLength = set.size
                    console.log('initial set:',set)
                    console.log('initLength:', initLength)
                    set.add(peerID)
                    console.log('modified set:',set)
                    console.log('mod Length:', set.size)
                    if(set.size > initLength){
                        console.log(`set lengthened, set portfolio[${index}].value = ${[...set]}`)
                        $portfolio[index].value = [...set]
                    }
                }	
            })

            peerID = '' //clear text input)
        }
    };

    async function updateDAGArray(cid, key, value){
        // get existing contacts rootHash -> Contacts Array
        const cidDataObj = (await $ipfsNode.dag.get(cid)).value
        
        // update the object at the key with the new value
        if(cidDataObj.hasOwnProperty(key)){
            cidDataObj[key].push(value)
        }else{
            // create it
            cidDataObj[key] = value
        }

        return await $ipfsNode.dag.put(cidDataObj, { pin: true }) // new cid
    }

</script>
<div>Add Peer: 
<input 
    bind:value={peerID} 
    on:input={handleInput}
    placeholder="Paste a Peer ID Here" >
{peerID ? (peerID+'').length : " -- "}
</div>