/*
Creates a profile. Profile's have their own:
- Public/Private key pair

Can run multiple profiles on one IPFS node. Pass the IPFS node into the profile 
to "borrow" it to pubsub stuff. 
*/
import { createKeyPair } from "../components/pkiHelper.js";

class Profile {
  constructor(password = "", rootHash) {
    // if no pw given, makeup a random one
    password === "" ? String(Math.random() + Date.now()) : password;

    return (async () => {
      // All async code here
      this.kp = await createKeyPair(password);
      this.publicKey = this.kp.publicKey;
      this.privateKey = this.kp.privateKey;
      this.rootHash = rootHash
      return this; // when done
    })();
  }

}

export default Profile;
