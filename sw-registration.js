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
        console.log('Registration successful with scope: ', registration.scope);
      }).catch((err) => {
        console.log('Registration failed with error: ', err);
      });

    navigator.serviceWorker.ready
      .then((registration) => {
        console.log('Service Worker Ready');
      });

  });
}

/**
 * Window load event listener to determine network status
 * https://developer.mozilla.org/en-US/docs/Web/API/NavigatorOnLine/Online_and_offline_events
 */
window.addEventListener('load', function() {
  var status = document.getElementById("status");
  
  function updateOnlineStatus(event) {
    var condition = navigator.onLine ? "online" : "offline";

    status.className = condition;
    status.innerHTML = `BROWSER ${condition.toUpperCase()}`;
  }

  window.addEventListener('online',  updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
});