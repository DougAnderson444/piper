import PouchDB from "pouchdb";

var localDB = new PouchDB("mypeerdb");
var remoteDB = new PouchDB("https://super.peerpiper.io:5999/peers", {
  skip_setup: true,
});

export async function put(doc) {
  try {
    localDB.put(doc, {force: true});
    return true;
  } catch (err) {
      console.log(err)
    return err;
  }
}

export async function get(id) {
    try {
      let i = await localDB.get(id);
      return i;
    } catch (err) {
        console.log(err)
      return err;
    }
}
export async function getInfo() {
  let info = await localDB.info();
  return info;
}

export async function getRemoteDBInfo() {
  let info;
  try {
    info = await remoteDB.info();
    return info;
  } catch (err) {
    console.log(err);
    return err;
  }
}

export function replicate() {
  localDB.replicate
    .to(remoteDB, {
      live: true,
      retry: true,
      back_off_function: function (delay) {
        if (delay === 0) {
          return 1000;
        }
        return delay * 3;
      },
    })
    .on("complete", function () {
      // yay, we're done!
      console.log(`Replication complete!`);
    })
    .on("error", function (err) {
      // boo, something went wrong!
      console.log(`Replication error: ${err}`);
    });
}
