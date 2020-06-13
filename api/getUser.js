const fetch = require("node-fetch"); // to make fetch work in nodejs

module.exports = async (req, res) => {
  // process.env.SAPPER_APP_SUPERPEER
  // saved at: https://vercel.com/douganderson444/peersapper/settings and .env for development

  const purl = `${process.env.SAPPER_APP_USERDB}/org.couchdb.user:${req.query.username}`; // pouch profile URL
  
  const resp = await postData(
    "GET",
    purl
  );
  res.send(resp) //json(resp) //.status(200).send(date);
};

async function postData(method = "", url, data = {}) {
  const response = await fetch(url, {
    method: method || "POST", // *GET, POST, PUT, DELETE, etc.
    headers: {
      "Authorization": "Basic " + Buffer.from(process.env.SAPPER_APP_AUTH).toString('base64'), // Buffer.from('Hello World!').toString('base64')
    }
  });
  return await response.json(); // parses JSON response into native JavaScript objects
}