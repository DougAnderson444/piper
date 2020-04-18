/*
Creates a profile. Profile's have their own:
- Public/Private key pair

Can run multiple profiles on one IPFS node. Pass the IPFS node into the profile 
to "borrow" it to pubsub stuff. 
*/
import { createKeyPair } from "../components/pkiHelper.js";
import { get } from "svelte/store";
import { ipfsNode, root } from "../components/stores.js";
import { signMessage, verifySignature } from "../components/pkiHelper.js";
import { saveDeepValue } from "../components/utils.js";

const pingText = "Ping!";

class Profile {
  constructor(password = "") {
    // if no pw given, makeup a random one
    password === "" ? String(Math.random() + Date.now()) : password;

    return (async () => {
      // All async code here
      this.kp = await createKeyPair(password);
      this.publicKey = this.kp.publicKey;
      this.privateKey = this.kp.privateKey;
      return this; // when done
    })();
  }

  ping(topic) {
    let node = get(ipfsNode);
    node.pubsub.publish(topic, pingText);
  }

  async publish(msgString) {
    // publish a msg and sign with this object's private key
    const msgSignature = signMessage(msgString, this.privateKey); // sign the msg, so they know it's legit
    const msgObj = { data: msgString, sig: msgSignature };
    let node = get(ipfsNode);

    try {
      let res = await node.pubsub.publish(
        this.publicKey,
        JSON.stringify(msgObj)
      ); // return a promise
      console.log(
        `Successfull published ${msgString} from ${this.publicKey}!`
      );
      return res;
    } catch (err) {
      console.log("Error subscribing, ", err);
      return new Error(err); //throw
    }
  }

  async subscribe(topic) {
    //set up subscription to listen to pings on this public key
    let node = get(ipfsNode);

    // what to do with the received
    const receiveMsg = msg => {
      console.log(`Pubsub RX-MSG rx'd: \n ${msg.data.toString()} `);

      if (msg.data.toString() == pingText) {
        // respond to ping
        const msgString = String("hash for " + msg.topicIDs[0]); //JSON.stringify(msgObj)
        console.log(`msgSTring: ${msgString}`);
        this.publish(msgString);
        console.log(
          `Ipfs.svelte responding to ping with ${msgString} on ${this.publicKey} >>> msg.topicIDs[0]: ${msg.topicIDs[0]}`
        );
      } else {
        const msgObj = JSON.parse(msg.data);
        const legit = verifySignature(msgObj.data, msgObj.sig, msg.topicIDs[0]);
        console.log(`legit: ${legit} `);
        if(legit){
          // do something with the data, like save it to your files
          let r = get(root);
          let breadcrumbs = [ (Object.keys(r))[0] ,"UUIDs", msg.topicIDs[0] ]
          console.log(`Saving [${(Object.keys(r))[0]},"UUIDs", ${msg.topicIDs[0]} ] = ${msgObj.data}`)
          let rNew = saveDeepValue(r, breadcrumbs, msgObj.data)
          console.log(`rNew is ${JSON.stringify(rNew)}`) //not updated :/
          // need to update the store somehow
        }
      }
    };

    try {
      let res = await node.pubsub.subscribe(topic, receiveMsg); // return a promise
      //console.log(`Successfull subscribed to ${topic}! res; ${res} `);
      return res;
    } catch (err) {
      console.log("Error subscribing, ", err);
      return new Error(err); //throw
    }
  }
}

export default Profile;
