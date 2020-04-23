import { signMessage, verifySignature } from "./pkiHelper.js";

export const PING_TEXT = "Ping!";

export async function ping(ipfsNode, topic) {
  try {
    const res = await ipfsNode.pubsub.publish(topic, PING_TEXT);
  } catch (err) {
    console.log("Error pinging, ", err);
    return new Error(err); //throw
  }
}

// profile listens for topic
export async function subscr(ipfsNode, topic, receiveHandler) {

  try {
    return await ipfsNode.pubsub.subscribe(topic, receiveHandler);
  } catch (err) {
    console.log("Error subsc'ing, ", err);
    return new Error(err); //throw
  }
}

export async function publish(ipfsNode, profile, msgString) {
  // publ a msg and sign with this profile's private key
  const msgSignature = signMessage(msgString, profile.privateKey); // sign the msg, so they know it's legit
  const msgObj = { data: msgString, sig: msgSignature };
  const msgStringified = JSON.stringify(msgObj);

  try {
    return await ipfsNode.pubsub.publish(profile.publicKey, msgStringified);
  } catch (err) {
    console.log("Error publish'ing, ", err);
    return new Error(err); //throw
  }
}
export function savePeerToRoot(root, peerID, value = {}) {
  // save the new object to root in the "right spot"
  let breadcrumbs = ["Contacts", peerID, "/"];
  saveDeepValue(root, breadcrumbs, value);
}

// saveDeepValue down into the object until reach key:value pair
export function saveDeepValue(obj, crumbs, value = {}) {
  if (crumbs.length > 1) {
    var e = crumbs.shift();
    if (obj[e] === undefined) {
      obj[e] = {};
    }
    saveDeepValue(obj[e], crumbs, value);
  } else {
    obj[crumbs[0]] = value;
  }
}



const util = {};
export default util;