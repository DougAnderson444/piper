// IPFS
import IPFS from "ipfs";
import { entropyToMnemonic, mnemonicToSeed } from "bip39";

const multiaddr =
  "/dns4/super.peerpiper.io/tcp/4033/wss/ipfs/QmPFeUqE4x17gy6cV3bb9yjfiZvwPAtmwmt4zZqgnfEoz5";

export const multiAddress = IPFS.multiaddr(multiaddr);

export default async function createIPFS(username) {
  let repo = "ipfs-" + username;

  // pass must be at least 20 char long
  const pass = "01234567890123456789";

  const options = {
    repo: repo, // default is "ipfs", string or ipfs.Repo instance, file path at which to store the IPFS node’s data, String(Math.random() + Date.now())
    pass: pass, // https://github.com/ipfs/js-ipfs/issues/1138
    EXPERIMENTAL: { ipnsPubsub: true },
    config: {
      //dht: {
      //enabled: true,
      //},
      Addresses: {
        Swarm: [
          // "/dns4/ws-star1.par.dwebops.pub/tcp/443/wss/p2p-websocket-star",
          // "/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star",
          // "/dns4/super.peerpiper.io/tcp/13577/wss/p2p-webrtc-star",
          // "/dns4/super.peerpiper.io/tcp/4033/wss/p2p/QmPFeUqE4x17gy6cV3bb9yjfiZvwPAtmwmt4zZqgnfEoz5"
        ],
      },
    },
  };

  let node = await IPFS.create(options);

  try {
    await node.swarm.connect(multiaddr);
    console.log(`Connected to ${multiaddr}`);
  } catch (e) {
    console.log(e);
  }

  return node;
}

export const fromB58String = async (str) => {
  return IPFS.multihash.fromB58String(str);
};

export function resolve(node, target) {
  return new Promise(async (resolve, reject) => {
    try {
      let hash;
      console.log(target);
      for await (const name of node.name.resolve(target)) {
        console.log(name); // /ipfs/QmQrX8hka2BtNHa8N8arAq16TCVx5qHcb46c5yPewRycLm
        hash = name.replace(/^\/ipfs\//, "");
        console.log(`resolves to 
          https://explore.ipld.io/#/explore/${hash}`);
      }
      resolve(hash); // resolve the Promise
    } catch (err) {
      console.log(`Error getting IPFS path: \n ${err}`);
      reject(err);
    }
  });
}

export const encrypt = async (key, IV, decryptedMessage) => {
  // Encrypting
  const cipher = await IPFS.crypto.aes.create(key, Buffer.from(IV));
  const encryptedBuffer = await cipher.encrypt(Buffer.from(decryptedMessage));
  return encryptedBuffer;
};

export const encryptSaveToIPFS = async (
  ipfsNode,
  path,
  decryptedMessage,
  key,
  iv
) => {
  // in private folder
  let encryptedBuffer = await encrypt(key, iv, decryptedMessage);

  const cidStr = await saveToIPFS(ipfsNode, path, encryptedBuffer);

  return cidStr;
};

export const importIPFSFolderToMFS = async (ipfsNode, rootHash, folder) => {
  // IF YOU ARE ADDING TO IPFS, YOU NEED TO IMPRT EXISTING DATA TO MAINTAIN THE GRAPH
  // How to import:
  // if there's no folder, then the QmHash will be copied as new folder name (not what we want)
  // if there's a folder name, it'll be put in root directory (what we want)
  // it'll paste over existing folders, lke private above
  try {
    await ipfsNode.files.cp(
      `/ipfs/${rootHash}${folder}`,
      "/",
      { parents: true } //create: true,
    );
  } catch (err) {
    console.log(err);
  }
};

export const saveToIPFS = async (ipfsNode, path, content) => {
  let cid;

  try {
    await ipfsNode.files.write(path, content, {
      create: true,
      parents: true,
    });
    // write to disk
    cid = await ipfsNode.files.flush(path);
  } catch (err) {
    console.log(err);
  }

  return cid;
};

export const getIndexHash = async (
  username,
  password,
  index = 0,
  tld = "tld"
) => {
  let salt, iterations, keySize, hash;
  salt = `${username}${tld}`;
  iterations = 1000;
  keySize = 32;
  hash = "sha2-256";

  var derivedKey = IPFS.crypto.pbkdf2(
    password,
    salt,
    iterations,
    keySize,
    hash
  );
  const buf = Buffer.from(derivedKey, "utf8");
  const seed = await IPFS.multihashing.digest(buf, "sha2-256");
  const ent = Buffer.from(seed); // from your `unit-test.ts` file
  const mnemonic = entropyToMnemonic(ent);
  const seedBuffer = await mnemonicToSeed(mnemonic);
  var incrementedSeed =
    Buffer.from(seed).toString("hex") +
    Buffer.from(index.toString()).toString("hex");
  const key = await IPFS.multihashing.digest(
    Buffer.from(incrementedSeed, "hex"),
    "sha2-256"
  );
  return key;
};

export const getHash = async (data) => {
  let hash = await IPFS.multihashing.digest(data, "sha2-256");
  return hash;
};
