// IPFS
import IPFS from "ipfs";

export default async function createIPFS(username) {
  let repo = "ipfs-" + username;

  // pass must be at least 20 char long
  const pass = "01234567890123456789";

  const options = {
    repo: repo, // default is "ipfs", string or ipfs.Repo instance, file path at which to store the IPFS node’s data, String(Math.random() + Date.now())
    pass: pass, // https://github.com/ipfs/js-ipfs/issues/1138
    config: {
      Addresses: {
        Swarm: [
          // "/dns4/ws-star1.par.dwebops.pub/tcp/443/wss/p2p-websocket-star",
          //"/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star",
          "/dns4/super.peerpiper.io/tcp/13577/wss/p2p-webrtc-star",
          "/dns4/super.peerpiper.io/tcp/4033/wss/ipfs/QmPFeUqE4x17gy6cV3bb9yjfiZvwPAtmwmt4zZqgnfEoz5",
        ],
      },
    },
  };

  let node = await IPFS.create(options);

  const multiaddr =
    "/dns4/super.peerpiper.io/tcp/4033/wss/ipfs/QmPFeUqE4x17gy6cV3bb9yjfiZvwPAtmwmt4zZqgnfEoz5";
  try {
    await node.swarm.connect(multiaddr);
    console.log(`Connected to ${multiaddr}`);
  } catch (e) {
    console.log(e);
  }

  return node;
}

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
