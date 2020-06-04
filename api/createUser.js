const fetch = require("node-fetch"); // to make fetch work in nodejs

module.exports = async (req, res) => {
  // process.env.SAPPER_APP_SUPERPEER
  // saved at: https://vercel.com/douganderson444/peersapper/settings and .env for development

  var username = 'user'+Math.floor(Math.random()*10000000)
  const purl = `${process.env.SAPPER_APP_USERDB}/org.couchdb.user:${username}`; // pouch profile URL
  var data = {
    _id: `org.couchdb.user:${username}`,
    name: username,
    type: "user",
    roles: [],
    password: req.query.pw
  };

  //console.log(`data is: \n ` + JSON.stringify(data, null,2));

  const resp = await postData(
    "PUT",
    purl,
    data
  );
  res.send(resp) //json(resp) //.status(200).send(date);
};

async function postData(method = "", url, data = {}) {
  const response = await fetch(url, {
    method: method || "POST", // *GET, POST, PUT, DELETE, etc.
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Basic " + Buffer.from(process.env.SAPPER_APP_AUTH).toString('base64'), // Buffer.from('Hello World!').toString('base64')
    },
    body: JSON.stringify(data), // body data type must match "Content-Type" header
  });
  return await response.json(); // parses JSON response into native JavaScript objects
}

/**
 * cURL equivalent (FYI & Testing)
 * 
  curl -X PUT "https://super.peerpiper.io:5999/_users/org.couchdb.user:dbreaderCurl" \
  -H "Authorization: Basic username:passwordINbase64" \
  -H "Content-Type: application/json" \
  -d '{
    "_id": "org.couchdb.user:dbreaderCurl",
    "name": "dbreaderCurl",
    "type": "user",
    "roles": [],
    "password": "plaintext_password"
  }'

 * 
 */