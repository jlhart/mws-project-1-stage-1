/*
 Copyright 2015 Google Inc. All Rights Reserved.
 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at
 http://www.apache.org/licenses/LICENSE-2.0
 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/
// https://developers.google.com/web/ilt/pwa/introduction-to-service-worker
// https://developers.google.com/web/fundamentals/primers/service-workers/
'use strict';

// Incrementing CACHE_VERSION will kick off the install event and force previously cached
// resources to be cached again.
const CACHE_VERSION = `v1`;
let CURRENT_CACHES = {
  cacheFiles: `mws-project-stage-one-${CACHE_VERSION}`
};

const cacheFiles = [
  '/',
  'index.html',
  'favicon.ico',
  'manifest.json',
  'node_modules/idb/lib/idb.js',
  'offline.html',
  'restaurant.html',
  'sw-registration.js',
  'css/styles.css',
  'js/main.js',
  'js/restaurant_info.js',
  'js/dbhelper.js',
  'img/icons-192.png',
  'img/icons-512.png',
  'img/no_image_available.jpg',
  'https://unpkg.com/leaflet@1.3.1/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.3.1/dist/leaflet.js',
  'https://unpkg.com/leaflet@1.3.1/dist/images/marker-icon.png',
  'https://unpkg.com/leaflet@1.3.1/dist/images/marker-icon-2x.png',
  'https://unpkg.com/leaflet@1.3.1/dist/images/marker-shadow.png',
  'https://fonts.googleapis.com/css?family=Roboto:400',
  'https://fonts.gstatic.com/s/roboto/v18/KFOmCnqEu92Fr1Mu72xKOzY.woff2',
  'https://fonts.gstatic.com/s/roboto/v18/KFOmCnqEu92Fr1Mu4mxK.woff2'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CURRENT_CACHES.cacheFiles).then((cache) => {
      return cache.addAll(cacheFiles);
    })
  );
});

self.addEventListener('activate', event => {
  // Delete all caches that aren't named in CURRENT_CACHES.
  // this logic will handle the case where
  // there are multiple versioned caches.
  let expectedCacheNames = Object.keys(CURRENT_CACHES).map((key) => {
    return CURRENT_CACHES[key];
  });

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (expectedCacheNames.indexOf(cacheName) === -1) {
            // If this cache name isn't present in the array of "expected" cache names,
            // then delete it.
            console.log('Deleting out of date cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // IMPORTANT: Clone the request. A request is a stream and
        // can only be consumed once. Since we are consuming this
        // once by cache and once by the browser for fetch, we need
        // to clone the response.
        let fetchRequest = event.request.clone();

        return fetch(fetchRequest)
          .then((response) => {
            // Check if we received a valid response
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // IMPORTANT: Clone the response. A response is a stream
            // and because we want the browser to consume the response
            // as well as the cache consuming the response, we need
            // to clone it so we have two streams.
            let responseToCache = response.clone();

            caches.open(CURRENT_CACHES.cacheFiles)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
    );
});