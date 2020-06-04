// scripts for publci key cryptography
import forge from "node-forge";
import IPFS from "ipfs";

var ed25519 = forge.pki.ed25519;
const alphabetRFC1924 = [
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z",
  "!",
  "#",
  "$",
  "%",
  "&",
  "(",
  ")",
  "*",
  "+",
  "-",
  ";",
  "<",
  "=",
  ">",
  "?",
  "@",
  "^",
  "_",
  "`",
  "{",
  "|",
  "}",
  "~",
];

// pki.publicKeyToPem(publicKey);
// util.binary.hex.encode
// util.binary.base58.encode

//forge.options.usePureJavaScript = true;
//https://github.com/digitalbazaar/forge/issues/535

function enco(buff) {
  return eb32(buff);
}

function deco(x) {
  return db32(x);
}

function eb32(buffer) {
  return IPFS.multibase.encode("base32", buffer).toString();
}

function db32(x) {
  return new forge.util.ByteBuffer(IPFS.multibase.decode(x), "binary");
}

function eb58(buffer) {
  return forge.util.binary.base58.encode(new forge.util.ByteBuffer(buffer));
}

function db58(x) {
  return new forge.util.ByteBuffer(
    forge.util.binary.base58.decode(x),
    "binary"
  );
}

function eb64(buffer) {
  return forge.util.encode64(new forge.util.ByteBuffer(buffer).bytes());
}

function db64(x) {
  return new forge.util.ByteBuffer(forge.util.decode64(x), "binary");
}
export function createKeyPair(password) {
  return new Promise((resolve, reject) => {
    var md = forge.sha256.create(); // md = message digest, aka hash
    md.update(password, "utf8");
    var seed = md.digest().getBytes();

    try {
      var keypair = ed25519.generateKeyPair({ seed: seed }); // keypair is NativeBuffer: var NativeBuffer = typeof Buffer === 'undefined' ? Uint8Array : Buffer;
      var privateKey = enco(keypair.privateKey);
      var publicKey = enco(keypair.publicKey);
      resolve({ publicKey, privateKey }); // resolve the Promise
    } catch (err) {
      reject(err);
    }
  });
}
/*
Take privateKey and sign the text message
*/
export function signMessage(msg, privateKey) {
  // sign a message digest (shorter "message" == better performance)
  var md = forge.md.sha256.create();
  md.update(msg, "utf8");
  var signature = ed25519.sign({
    md: md,
    privateKey: deco(privateKey),
  });
  return enco(signature);
}

/*
Take data and verify the signature
*/
export function verifySignature(data, sig, publicKey) {
  // verify a signature on a message digest
  var md = forge.md.sha256.create();
  md.update(data, "utf8");
  var verified = ed25519.verify({
    md: md,
    // node.js Buffer, Uint8Array, forge ByteBuffer, or binary string
    signature: deco(sig),
    // node.js Buffer, Uint8Array, forge ByteBuffer, or binary string
    publicKey: deco(publicKey),
  });
  return verified;
}

export function generatePBK(masterPassword, tld, username) {
  const salt = `${tld}${username}`;
  const derived = forge.pkcs5.pbkdf2(masterPassword, salt, 10000, 32, "sha256");
  const password = Array.from(derived)
    .map((byte) => alphabetRFC1924[byte % alphabetRFC1924.length])
    .join("");
  return forge.util.bytesToHex(derived); // in Hex
}
