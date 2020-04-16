// general utility functions for the rest of the app
import { signMessage, verifySignature } from "./pkiHelper.js";
import { get } from "svelte/store";
import { root, rootHash, keys, ipfsNode } from "./stores.js";

const pingText = "Ping!";
/*
export async function ping(ipfsNode, topic) {
  console.log(`Pinging ${topic} with ${pingText}`);
  await ipfsNode.pubsub.publish(topic, pingText);
}

export async function sub(ipfsNode, topic) {
  console.log(`subscribing to ${topic}`);
  try {
    return await ipfsNode.pubsub.subscribe(topic, receiveMsg); // return a promise
  } catch {
    return new Error("error"); //throw
  }
}

export async function pub(ipfsNode, topic, msg) {}

const receiveMsg = async msg => {
  //console.log(`Pubsub Msg rx'd: \n ${msg.data.toString()} `)
  let hash = get(rootHash);
  console.log(`hash is ${hash}`)
  let k = get(keys);
  let i = get(ipfsNode);
  //handle Ping
  if (msg.data.toString() == pingText) {
    // respond by broadcasting the r00t hash
    //console.log(`respond by broadcasting the r00t hash \n ${addedFileHash} \nto topic \n ${topic} `)
    // get values from the store, since this is a plain old .js file and not svelte

    // sign the msg, so they know it's legit
    const msgSignature = signMessage(hash, k.privateKey);
    const msgObj = { data: hash, sig: msgSignature };
    const msgString = JSON.stringify(msgObj);
    await i.pubsub.publish(k.publicKey, msgString);
    console.log(`utils publishing ${msgString} to ${k.publicKey} `);
  } else {
    // handle data response
    //console.log(`got acutal data: \n ${JSON.parse(msg.data.toString())} `)

    const msgObj = JSON.parse(msg.data); // CID object, content ID
    //console.log(`check the signature: \n Does ${JSON.parse(msg.data.toString()).data} \n Signature: ${JSON.parse(msg.data.toString()).sig}\nmatch ${$keys.publicKey}`)

    const legit = verifySignature(msgObj.data, msgObj.sig, k.publicKey);
    console.log(`legit: ${legit} => ${msg.data.toString()}`);
    // save the data to the proper location
    console.log(`topicIDs: ${JSON.stringify(msg.topicIDs)} `);
    //save this msg data to the msg topic
    let newRoot = get(root)
    console.log(`newRoot["UUIDs"][${msg.topicIDs[0]}] = ${JSON.stringify(JSON.parse(msg.data.toString()).data)} `)
    newRoot["UUIDs"][msg.topicIDs[0]]["rootHash"] = JSON.stringify(msgObj.data.toString()) //(JSON.parse(msg.data.toString()).data).toString()
    root.update( () => newRoot )
  }
};
*/
const util = {};
export default util;
