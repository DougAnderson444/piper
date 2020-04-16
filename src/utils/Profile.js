/*
Creates a profile. Profile's have their own:
- Public/Private key pair

Can run multiple profiles on one IPFS node. Pass the IPFS node into the profile 
to "borrow" it to pubsub stuff. 
*/
import { createKeyPair } from "../components/pkiHelper.js";
import { get } from "svelte/store";
import { ipfsNode } from "../components/stores.js";
import { signMessage, verifySignature } from "../components/pkiHelper.js";

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
      console.log(`keypair made!!!`);
      return this; // when done
    })();
  }

  ping(topic) {
    console.log(`Pinging ${topic}!`);
    let node = get(ipfsNode);
    node.pubsub.publish(topic, pingText);
  }

  async publish(msgString) {
    // publish a msg and sign with this object's private key
    const msgSignature = signMessage(msgString, this.privateKey); // sign the msg, so they know it's legit
    const msgObj = { data: msgString, sig: msgSignature };
    let node = get(ipfsNode);

    try {
			let res = await node.pubsub.publish(this.publicKey, JSON.stringify(msgObj)); // return a promise
			console.log(`Successfull published ${msg} to ${this.publicKey}! ${res}`)
			return res

    } catch {
			console.log("Error subscribing, ", err);
      return new Error(err); //throw
		}
  }
	
  async subscribe(topic) {
    //set up subscription to listen to pings on this public key
    let node = get(ipfsNode);

    const receiveMsg = msg => {
      console.log(`Pubsub RX-MSG rx'd: \n ${msg.data.toString()} `);

      if (msg.data.toString() == pingText) {
        // respond to ping
        const msgString = String("hash for " + JSON.stringify(msg.topicIDs[0])); //JSON.stringify(msgObj)
        console.log(`msgSTring: ${msgString}`);
        this.publish(msgString);
        console.log(
          `Ipfs.svelte responding to ping with ${msgString} on ${this.publicKey} >>> msg.topicIDs[0]: ${msg.topicIDs[0]}`
        );
      } else {
        //console.log(`got acutal data: \n ${JSON.parse(msg.data.toString())} `)

        const msgObj = JSON.parse(msg.data);

        /*
			console.log(
							`check the signature: \n Does ${
									JSON.parse(msg.data.toString()).data
							} \n Signature: ${JSON.parse(msg.data.toString()).sig}\nmatch ${
									msg.topicIDs[0]
							}`
			);
			*/
        const legit = verifySignature(msgObj.data, msgObj.sig, msg.topicIDs[0]);
        console.log(`legit: ${legit} `);
      }
		}
		
    try {
      let res = await node.pubsub.subscribe(topic, receiveMsg); // return a promise
      console.log(`Successfull subscribed to ${topic}! res; ${res} `);
      return res;
    } catch (err) {
      console.log("Error subscribing, ", err);
      return new Error(err); //throw
		}
		
  }
}

export default Profile;
