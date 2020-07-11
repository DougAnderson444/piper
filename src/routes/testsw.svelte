<script>
  //   "gcm_sender_id": "958213794693"
  import { onMount } from 'svelte'

  export let delay = 5
  export let ttl = 0
  let handleClick

  onMount(() => {
    navigator.serviceWorker.register('/service-worker.js', { scope: '/' }) //Register a Service Worker.

    navigator.serviceWorker.ready
      .then((registration) => {
        return registration.pushManager
          .getSubscription() //get the user’s subscription to the push service.
          .then(async (subscription) => {
            if (subscription) {
              return subscription // If a subscription was found, return it.
            }
            const response = await fetch('/api/vapidPublicKey') // Get the server’s public key
            const vapidPublicKey = await response.text()
            console.log(vapidPublicKey)
            const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey) // Chrome doesn’t accept the base64-encoded (string) vapidPublicKey yet; urlBase64ToUint8Array() is defined in /tools.js
            console.log(convertedVapidKey)
            let sub
            try {
              sub = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: convertedVapidKey,
              })
              console.log(sub)
            } catch (err) {
              console.log(err)
            }
            return sub
          })
      })
      .then((subscription) => {
        //Send the subscription details to the server
        fetch('/api/register', {
          method: 'post',
          headers: {
            'Content-type': 'application/json',
          },
          body: JSON.stringify({
            subscription: subscription,
          }),
        })

        handleClick = () => {
          console.log('Button clicked, fetch notification')
          fetch('/api/sendNotification', {
            method: 'post',
            headers: {
              Authorization: 'None',
              'Content-type': 'application/json',
            },
            body: JSON.stringify({
              subscription: subscription,
              delay: delay,
              ttl: ttl,
            }),
          })
        }
      })
  })

  // This function is needed because Chrome doesn't accept a base64 encoded string
  // as value for applicationServerKey in pushManager.subscribe yet
  // https://bugs.chromium.org/p/chromium/issues/detail?id=802280
  function urlBase64ToUint8Array(base64String) {
    var padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    var base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/')

    var rawData = window.atob(base64)
    var outputArray = new Uint8Array(rawData.length)

    for (var i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }
</script>

<p>
  This demo shows how to register for push notifications and how to send them.
</p>

<form>
  Notification delay:
  <input bind:value={delay} id="notification-delay" type="number" />
  seconds Notification Time-To-Live:
  <input bind:value={ttl} id="notification-ttl" type="number" />
  seconds
</form>

<button on:click={handleClick}>Try to conquer Italy!</button>
