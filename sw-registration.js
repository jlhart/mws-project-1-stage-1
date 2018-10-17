/**
 * Taken from lessons learned at: https://developers.google.com/web/ilt/pwa/introduction-to-service-worker
 */ 
if('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js', { scope: '/' })
    .then(function(registration) {
      console.log('Registration successful with scope: ', registration.scope);
    }).catch(function(err) {
      console.log('Registration failed with error: ', err);
    });

  navigator.serviceWorker.ready.then(function(registration) {
     console.log('Service Worker Ready');
  });
}