const fetch = require("node-fetch"); // to make fetch work in nodejs

module.exports = async (req, res) => {
  const dnslinkurl = `dnslink=/ipfs/${req.query.hash}`;

  let dataObj = {
    name: req.query.subdomain, //"_dnslink",  //subdomain
    type: "TXT",
    value: dnslinkurl,
  };
  console.log(`Dev token is ${process.env.SAPPER_APP_DNSTOKEN}`);
  //console.log(`DNS object is is \n ${JSON.stringify(dataObj)}`);

  const resp = await postData(
    "https://api.zeit.co/v2/domains/peerpiper.io/records",
    dataObj
  );
  console.log(`POST response is: `);
  console.log(resp.uid);

  res.send(resp.uid); //json(resp) //.status(200).send(date);
};

async function postData(url = "", data = {}) {
  const response = await fetch(url, {
    method: "POST", // *GET, POST, PUT, DELETE, etc.
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.SAPPER_APP_DNSTOKEN}`, //${process.env.ZEIT_TOKEN_DEV}`
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: JSON.stringify(data), // body data type must match "Content-Type" header
  });
  return await response.json(); // parses JSON response into native JavaScript objects
}
