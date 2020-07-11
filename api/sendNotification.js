const webPush = require("web-push");

// web-push setup

if (
  !process.env.SAPPER_APP_VAPID_PUBLIC_KEY ||
  !process.env.SAPPER_APP_VAPID_PRIVATE_KEY
) {
  console.log(
    "You must set the VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY " +
      "environment variables. You can use the following ones:"
  );
  console.log(webPush.generateVAPIDKeys());
}

//Set the keys used for encrypting the push messages.
webPush.setVapidDetails(
  "mailto:info@peerpiper.io",
  process.env.SAPPER_APP_VAPID_PUBLIC_KEY,
  process.env.SAPPER_APP_VAPID_PRIVATE_KEY
);

module.exports = (req, res) => {
  /*
        res.json({
        body: req.body,
        query: req.query,
        cookies: req.cookies,
    });
    */
  const subscription = req.body.subscription;
  const payload = null;
  const options = {
    TTL: req.body.ttl,
  };

  console.log("Sending notification", subscription);

  setTimeout(function () {
    console.log("Delayed ", req.body.delay);

    webPush
      .sendNotification(subscription, payload, options)
      .then(function () {
        res.status(201);
      })
      .catch(function (error) {
        res.status(500);
        console.log(error);
      });
  }, req.body.delay * 1000);
};
