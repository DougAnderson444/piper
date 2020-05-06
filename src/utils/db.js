import PouchDB from "pouchdb";

var localDB = new PouchDB("mypeerdb");
var remoteDB = new PouchDB("https://super.peerpiper.io:5999/peers");

export async function getInfo() {
  let info = await localDB.info();
  console.log(info);
  return info;
}

export function replicate() {
  localDB.replicate
    .to(remoteDB)
    .on("complete", function () {
      // yay, we're done!
      console.log(`Replication complete!`);
    })
    .on("error", function (err) {
      // boo, something went wrong!
      console.log(`Replication error: ${err}`);
    });
}
