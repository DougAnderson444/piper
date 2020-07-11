module.exports = (req, res) => {
    /*
        res.json({
        body: req.body,
        query: req.query,
        cookies: req.cookies,
    });
    */
  res.status(200).send(process.env.SAPPER_APP_VAPID_PUBLIC_KEY);
};