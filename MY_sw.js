const version = "0.0.1";
const cacheName = `mws-project-stage-one-${version}`;
const offlinePage = 'offline.html';
const errorPage = '404.html';

importScripts('./js/cache-polyfill.js');

console.log('Service Worker Cache Name: ', cacheName);
self.addEventListener('install', e => {
    console.log('Service Worker: Installed');
    e.waitUntil(
        caches.open(cacheName)
        .then(cache => {
            console.log('Service Worker: Caching Files');
            return cache.addAll([
                '/',
                './sw-registration.js',
                'index.html',
                '404.html',
                'offline.html',
                'restaurant.html',
                './data/restaurants.json',
                './js/main.js',
                './js/restaurant_info.js',
                './js/dbhelper.js',
                './css/styles.css',
                'favicon.ico',
                './img/1-large_3x.jpg',
                './img/1-medium_2x.jpg',
                './img/1-small_1x.jpg',
                './img/1.jpg',
                './img/2-large_3x.jpg',
                './img/2-medium_2x.jpg',
                './img/2-small_1x.jpg',
                './img/2.jpg',
                './img/3-large_3x.jpg',
                './img/3-medium_2x.jpg',
                './img/3-small_1x.jpg',
                './img/3.jpg',
                './img/4-large_3x.jpg',
                './img/4-medium_2x.jpg',
                './img/4-small_1x.jpg',
                './img/4.jpg',
                './img/5-large_3x.jpg',
                './img/5-medium_2x.jpg',
                './img/5-small_1x.jpg',
                './img/5.jpg',
                './img/6-large_3x.jpg',
                './img/6-medium_2x.jpg',
                './img/6-small_1x.jpg',
                './img/6.jpg',
                './img/7-large_3x.jpg',
                './img/7-medium_2x.jpg',
                './img/7-small_1x.jpg',
                './img/7.jpg',
                './img/8-large_3x.jpg',
                './img/8-medium_2x.jpg',
                './img/8-small_1x.jpg',
                './img/8.jpg',
                './img/9-large_3x.jpg',
                './img/9-medium_2x.jpg',
                './img/9-small_1x.jpg',
                './img/9.jpg',
                './img/10-large_3x.jpg',
                './img/10-medium_2x.jpg',
                './img/10-small_1x.jpg',
                './img/10.jpg',
                './img/icons-192.png',
                './img/icons-512.png'
            ])
            .then(() => self.skipWaiting());
        })
    );
});

self.addEventListener('activate', event => {
    console.log('Service Worker: Activated');
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
    console.log('Service Worker: Fetching');
    event.respondWith(
        caches.open(cacheName)
        .then(cache => cache.match(event.request, {ignoreSearch: true}))
        .then(response => {
            if (response) {
                console.log(`Found ${event.request} in cache`);
                return response;
            } else {
                console.log(`Could not find ${event.request} in cache: fetching.`);
                return fetch(event.request);
            }
        })
        .catch(() => caches.match(errorPage))
    );
});


// self.addEventListener('fetch', event => {
//     console.log('Service Worker: Fetching');
//     event.respondWith(
//         caches.open(cacheName)
//         .then(cache => cache.match(event.request, {ignoreSearch: true}))
//         .then((cached) => {
//             var networked = fetch(event.request)
//                 .then(response => {
//                     if (response) {
//                         console.log(`Found ${event.request} in cache`);
//                         let cacheCopy = response.clone()
//                         caches.open(cacheName)
//                             .then(c => c.put(event.request, cacheCopy))
//                         return response;
//                     }
//                 })
//                 .catch(() => caches.match(offlinePage));
//             return cached || networked;
//         })
//     );
// });


// self.addEventListener('fetch', (event) => {
//     if (event.request.method === 'GET') {
//         event.respondWith(
//         caches.match(event.request)
//         .then((cached) => {
//             var networked = fetch(event.request)
//             .then((response) => {
//                 let cacheCopy = response.clone()
//                 caches.open(cacheName)
//                 .then(cache => cache.put(event.request, cacheCopy))
//                 return response;
//             })
//             .catch(() => caches.match(offlinePage));
//             return cached || networked;
//         })
//         )
//     }
//     return;
// });