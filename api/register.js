module.exports = (req, res) => {
    /*
        res.json({
        body: req.body,
        query: req.query,
        cookies: req.cookies,
    });
    */
  const vapidKey = process.env.SAPPER_APP_VAPID_PUBLIC_KEY;
  res.status(201);
};