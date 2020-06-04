/*
Creates a profile. Profile's have their own:
- Public/Private key pair

Can run multiple profiles on one IPFS node. Pass the IPFS node into the profile 
to "borrow" it to pubsub stuff. 
*/
import { createKeyPair } from "../components/pkiHelper.js";

class Profile {
  constructor(password = "", rootHash, handle) {
    // if no pw given, makeup a random one
    password === password || String(Math.random() + Date.now());

    return (async () => {
      // All async code here
      this.kp = await createKeyPair(password);
      this.publicKey = this.kp.publicKey;
      this.privateKey = this.kp.privateKey;
      this.privatePEM = forge.pki.privateKeyToPem(this.privateKey) //covert to PEM
      this.rootHash = rootHash
      this.url = handle + ".peerpiper.io"; 
      return this; // when done
    })();
  }

}

export default Profile;
