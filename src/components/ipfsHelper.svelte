<script>

import { ipfsNode, root, keys } from './stores.js'
import { signMessage, verifySignature } from './pkiHelper.js';

/*
Enables component to do thing like:

 subscribe()
    .then(console.log(`Successfull subscribed!`))
    .catch(
        (err)=>{console.log("Error subscribing, ", err)}
        )
    .then(
            ping())

*/

//Subscribe to PublicKey Topic on pubsub once node is ready and keys are ready
//$: topic = $keys.publicKey

const pingText = "Ping!"

export async function ping(topic){
    console.log(`Pinging ${topic}`)
    $ipfsNode.pubsub.publish(topic, pingText)
}

export async function subscribe(topic){
    console.log(`subscribing to ${topic}`)
    try{
        return await $ipfsNode.pubsub.subscribe(topic, receiveMsg)  // return a promise
    }catch{
        return new Error("error"); //throw 
    }
}

const receiveMsg = async(msg) => {
    //console.log(`Pubsub Msg rx'd: \n ${msg.data.toString()} `)
    
    //handle Ping
    if(msg.data.toString() == pingText){
        // respond by broadcasting the r00t hash
        //console.log(`respond by broadcasting the r00t hash \n ${addedFileHash} \nto topic \n ${topic} `)
        // sign the msg, so they know it's legit
        const msgSignature = signMessage($rootHash, $keys.privateKey) 
        const msgObj = {data: $rootHash, sig: msgSignature}
        const msgString = JSON.stringify(msgObj)
        await $ipfsNode.pubsub.publish(topic, msgString)
        console.log(`published to ${topic} in rxMsg`)
    }else{
    // handle data response
        //console.log(`got acutal data: \n ${JSON.parse(msg.data.toString())} `)
        
        const msgObj = JSON.parse(msg.data)
        //console.log(`check the signature: \n Does ${JSON.parse(msg.data.toString()).data} \n Signature: ${JSON.parse(msg.data.toString()).sig}\nmatch ${$keys.publicKey}`)

        const legit = verifySignature(msgObj.data, msgObj.sig, $keys.publicKey)
        console.log(`legit: ${legit} `)
        // save the data to the proper location
        console.log(`topicIDs: ${JSON.stringify(msg.topicIDs)} `)
        
    }

}
</script>