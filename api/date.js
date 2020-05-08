//const sapperEnv = require('sapper-environment');

module.exports = (req, res) => {
    /*
        res.json({
        body: req.body,
        query: req.query,
        cookies: req.cookies,
    });
    */
  const date = new Date().toString() + " "+ process.env.SAPPER_APP_TEST;
  res.status(200).send(date);
};

/**
   * ipfs.name.resolve(path, {recursive: true, nocache: true}) 
   * ipfs.dns('docs.ipfs.io').then(console.log)
   * http/gateway/resources/gateway.js > resolveIpns
   * http.api = new Daemon
      gateway = http.api._httpApi._gatewayServers[0]
      const res = await gateway.inject({
      method: 'GET',
      url: ipnsPath
    })
   * 
   */
