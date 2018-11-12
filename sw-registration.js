/**
 * Taken from lessons learned at: https://developers.google.com/web/ilt/pwa/introduction-to-service-worker
 */ 
if('serviceWorker' in navigator) {
  // Delay registration until after the page has loaded, to ensure that our
  // precaching requests don't degrade the first visit experience.
  // See https://developers.google.com/web/fundamentals/instant-and-offline/service-worker/registration
  window.addEventListener('load', () => {
    
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then((registration) => {
        console.log('Registration successful with scope: ', registration.scope)
      }).catch((err) => {
        console.log('Registration failed with error: ', err)
      });

    navigator.serviceWorker.ready
      .then((registration) => {
        return registration.sync.register('sendData')
      })
      .then(() => {
        console.log('Sync event registered...listening...')
      })
      .catch(() => {
        // system was unable to register for a sync,
        // this could be an OS-level restriction
        console.log('Sync registration failed!')
      });

  });
}

/**
 * Window load event listener to determine network status
 * https://developer.mozilla.org/en-US/docs/Web/API/NavigatorOnLine/Online_and_offline_events
 */
window.addEventListener('load', () => {
  var status = document.getElementById("status");
  
  function updateOnlineStatus(event) {
    var condition = navigator.onLine ? "online" : "offline";

    if(condition === 'online') {
      console.log('Connection is: ONLINE, Sending any offline Posts to server...');
      DBHelper.sendPostsToServer();
    }

    status.className = condition;
    status.innerHTML = `BROWSER ${condition.toUpperCase()}`;
  }

  window.addEventListener('online',  updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
});