/**
 * CONSTANTS for DBHelper
 */
  const DB_NAME = 'mws-restaurant-jlhart';
  const DB_VERSION = 3;
  const PORT = 1337;

/**
 * Common database helper functions.
 */
class DBHelper {

  /**
   *  Open the Indexed Db store
   */
  static openDatabase() {
    if (!navigator.serviceWorker) {
      return Promise.resolve;
    }
    return idb.open(DB_NAME, DB_VERSION, db => {

      switch (db.oldVersion) {
        case 0:
          let restaurantStore = db.createObjectStore('restaurants', { keyPath: 'id' })
          let cuisineStore = db.createObjectStore('cuisines', { unique: true})
          let neighborhoodStore = db.createObjectStore('neighborhoods', { unique: true})
          let reviewsStore = db.createObjectStore('reviews', { keyPath: 'id' }).createIndex('restaurant_id', 'restaurant_id');
          let offlineStore = db.createObjectStore('offline', { keyPath: 'guid' }).createIndex('guid', 'guid');
      }
    })
    // make sure restaurants are fetched
    .then(db => {
      if (DBHelper.fetched) return db // if already fetched return db handle...
      // otherwise...
      return new Promise((resolve, reject) => {
        DBHelper.fetchRestaurants((e) => {
          if (e) return reject(e) // error encountered...return reject...
          DBHelper.fetched = true // register fetched...
          resolve(db) // return db handle...
        }, Promise.resolve(db)) // resolve promise...
      })
    })
  };

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    return `http://localhost:${PORT}`;
  };

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback, db) {

    if (!db) db = DBHelper.openDatabase() // open idb if it was not passed...
    // ...then...with db...
    db.then(db => {
      // get all restaurants from the db object...
      return db.transaction('restaurants').objectStore('restaurants').getAll()
      .then(restaurants => {
        if (restaurants.length < 10) // if less than 10 restaurants returned...
          return fetch(DBHelper.DATABASE_URL+'/restaurants') // call DB for more...

          .then(data => data.json())  // then return json for returned restaurant data...
          // then ensure restaurants added to db/store...
          .then(restaurants => {
            const tx = db.transaction('restaurants', 'readwrite'); // add each restaurant...
            const os = tx.objectStore('restaurants'); // set handle to object store...
            restaurants.map(r => os.put(r)) // map over each restaurant & add to object store...
            return tx.complete.then(() => restaurants); // then return restaurants...
          })
          // then add cuisines/neighborhoods to their db/stores...
          .then(restaurants => {
            const cuisine_tx    = db.transaction('cuisines', 'readwrite'); // add each cuisine...
            const cuisine_store = cuisine_tx.objectStore('cuisines') // set handle to object store...
            // add restaurant cuisines types to cuisine store
            restaurants.forEach(r => cuisine_store.put(r.cuisine_type, r.cuisine_type))

            const neighborhood_tx    = db.transaction('neighborhoods', 'readwrite'); // add each neighborhood...
            const neighborhood_store = neighborhood_tx.objectStore('neighborhoods') // set handle to object store...
            // add restaurant neighborhoods types to neighborhood store
            restaurants.forEach(r => neighborhood_store.put(r.neighborhood, r.neighborhood))
            
            // ensure all promises are fulfilled before returning...
            return Promise.all([cuisine_tx.complete, neighborhood_tx.complete])
            .then(() => restaurants) // pass resulting data back to restaurants object
          })
        // return restaurants from idb
        return restaurants
      })
    })
    // then send restaurants object to callback...
    .then(restaurants => callback(null, restaurants))
    .catch(e => callback(e, null))  // catch/trap errors and send to callback...
  }// END fetchRestaurants(callback, db)...

  /**
   * Generate GUID for use in uniquely identifying objects for reference/removal.
   * Adapted from: https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
   */
  static guid() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    )
  } // END guid()...

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {

    // open database
    DBHelper.openDatabase()

    // get by id
    .then(db => db.transaction('restaurants').objectStore('restaurants').get(parseInt(id)))

    // callback
    .then(restaurant => {
      // if not existing try fetching the restaurant
      if (!restaurant)
        return fetch(`${DBHelper.DATABASE_URL}/restaurants/${id}`)
        .then(data => data.json())
        .then(restaurant => callback(null, restaurant))

      // success
      callback(null, restaurant)
    })

    // catch errors
    .catch(e => callback(e, null))
  };

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {

    let restaurants = []

    // open database
    DBHelper.openDatabase().then(db => {

      // loop through items
      const tx = db.transaction('restaurants');
      tx.objectStore('restaurants').openCursor().then(function cursorIterate(cursor) {
        if (!cursor) return;

        // filter results
        if (cursor.value.cuisine_type == cuisine) restaurants.push(cursor.value)

        return cursor.continue().then(cursorIterate);
      });

      return tx.complete
    })

    // callback
    .then(() => callback(null, restaurants))

    // in case of any error
    .catch(e => callback(e, null))
  };

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {

    let restaurants = []

    // open database
    DBHelper.openDatabase().then(db => {

      // loop through items
      const tx = db.transaction('restaurants');
      tx.objectStore('restaurants').openCursor().then(function cursorIterate(cursor) {
        if (!cursor) return;

        // filter results
        if (cursor.value.neighborhood == neighborhood) restaurants.push(cursor.value)

        return cursor.continue().then(cursorIterate);
      });

      return tx.complete
    })

    // callback
    .then(() => callback(null, restaurants))

    // in case of any error
    .catch(e => callback(e, null))
  };

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {

    let restaurants = []

    // open database
    DBHelper.openDatabase()


    .then(db => {

      // loop through items
      const tx = db.transaction('restaurants');
      tx.objectStore('restaurants').openCursor().then(function cursorIterate(cursor) {
        if (!cursor) return;


        // filter results
        if ( (cursor.value.cuisine_type == cuisine      || cuisine == 'all')
          && (cursor.value.neighborhood == neighborhood || neighborhood == 'all'))

          restaurants.push(cursor.value)

        return cursor.continue().then(cursorIterate);
      });

      return tx.complete
    })

    // callback
    .then(() => callback(null, restaurants))

    // in case of any error
    .catch(e => callback(e, null))
  };

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // open database
    DBHelper.openDatabase()

    // get by neighborhood index
    .then(db => db.transaction('neighborhoods').objectStore('neighborhoods'))

    // get keys
    .then(index => index.getAll())

    // callback
    .then(keys => callback(null, keys))

    // in case of error
    .catch(e => callback(e, null))
  };

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // open database
    DBHelper.openDatabase()

    // get by cuisine index
    .then(db => db.transaction('cuisines').objectStore('cuisines'))

    // get keys
    .then(index => index.getAll())

    // callback
    .then(keys => callback(null, keys))

    // in case of error
    .catch(e => callback(e, null))
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  };
  
  /**
   * Fetch all reviews with proper error handling.
   */
  static fetchReviews(callback) {
    // open database
    DBHelper.openDatabase()

    // get by reviews index
    .then(db => db.transaction('reviews').objectStore('reviews'))

    // get keys
    .then(index => index.getAll())

    // callback
    .then(keys => callback(null, keys))

    // in case of error
    .catch(e => callback(e, null))
  };

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  };

  /**
   * Restaurant image data.
   */
  static imageDataForRestaurant(restaurant) {
    const image = document.createElement('img');
    image.className = 'restaurant-img';

    // get image file data and build the srcset for responsive images
    const imgUrl = ((restaurant.photograph === undefined) ? 'none' : `img/${restaurant.photograph}`);

    // srcset code found in forum... can't remember where :p
    const imgFilename = imgUrl.split('.');

    // check for no image or undefined to ensure images are shown even if not available
    const file = (imgFilename[0] === 'none' || imgFilename[0] === undefined) ? 'img/no_image_available' : imgFilename[0];

    // default to jpg format if no extension provided
    const ext = (imgFilename[1] === undefined) ? 'jpg' : imgFilename[1];
    
    // check for no image or undefined to ensure images don't break
    if (file !== 'img/no_image_available') {
      image.srcset = `${file}-large_3x.${ext} 800w, ${file}-medium_2x.${ext} 480w, ${file}-small_1x.${ext} 320w`;
      image.alt = `image of ${restaurant.name} restaurant, specializing in ${restaurant.cuisine_type}, located in ${restaurant.neighborhood}`;
    } else {
      image.srcset = `${file}.${ext}`;
      image.alt = `image for ${restaurant.name} restaurant, specializing in ${restaurant.cuisine_type}, located in ${restaurant.neighborhood} - Image unavailable`;
    }
    // end srcset code

    // build final src for image element
    image.src = `${file}.${ext}`;

    // return the image element
    return image;
  };

  /**
   * Add Review to API/Local/iDb accordingly
   */
  static addReview(review) {
    
    console.log('addReview: ', review);

    let guid = (review.guid && review.guid !='') ? review.guid : DBHelper.guid();

    // Build data transport...
    let reviewSend = {
      "name": review.name,
      "rating": parseInt(review.rating),
      "comments": review.comments,
      "restaurant_id": parseInt(review.restaurant_id),
      "guid": guid
    };

    // If the review has not been added to offline db add it...
    if(!review.guid) {
      DBHelper.openDatabase() // open database
        .then(db => {  // add posted review to offline first local store
          const tx = db.transaction('offline', 'readwrite'); // add every review to offline...
          const os = tx.objectStore('offline'); // set handle to object store...
          os.put(reviewSend) // add review to object store...
          return tx.complete; 
        })
    }

    console.log('Attempting to Post your review: ', reviewSend);

    var fetch_options = { // setup fetch options
      method: 'POST',
      body: JSON.stringify(reviewSend),
      headers: new Headers({'Content-Type': 'application/json'})
    };

    // perform fetch POST of review to API endpoint
    fetch(DBHelper.DATABASE_URL+`/reviews`, fetch_options).then((response) => {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.indexOf('application/json') !== -1) {
        return response.json();
      } else { return 'API call successfull'}})
    .then((data) => { // Yay! POST successful...now store review in iDb

      console.log(`Fetch successful!`, data);

      DBHelper.openDatabase() // open database
      .then(db => {  // add posted review to local store
        const tx = db.transaction('reviews', 'readwrite'); // add each review...
        const os = tx.objectStore('reviews'); // set handle to object store...
        os.put(data) // add review to object store...
        return db; 
      })
      .then(db => {  // remove posted review from local store
        const tx = db.transaction('offline', 'readwrite'); // delete the review from offline...
        const os = tx.objectStore('offline'); // set handle to object store...
        os.delete(data.guid) // delete review from object store...
        return tx.complete; 
      })

    })
    .catch(error => {
      console.log('error:', error)
    });
  };

  static updateFavoriteStatus(restaurantId, isFav) {
    const db = DBHelper.openDatabase(); // get handle on database...

    // update favorite status via API...
    fetch(DBHelper.DATABASE_URL+`/restaurants/${restaurantId}/?is_favorite=${isFav}`, {
        method: 'PUT'
      })
      .then(() => {
        if (!db) db = DBHelper.openDatabase() // open idb if it was not open...
          // ...then...with db...
          db.then(db => {
            const tx = db.transaction('restaurants', 'readwrite');
            const restaurantsStore = tx.objectStore('restaurants');
            restaurantsStore.get(restaurantId)
              .then(restaurant => {
                restaurant.is_favorite = isFav;
                restaurantsStore.put(restaurant); // update restaurant store with favorite status...
              });
          });
      });
  };

  /**
   * sendPostsToServer()
   */
  static async sendPostsToServer() {
    console.log('Checking for offline data to send...')

    // open database
    return await DBHelper.openDatabase().then(db => {
      db.transaction('offline').objectStore('offline').getAll()
      .then(reviews => {
        // loop through items
        console.log(reviews)
        reviews.forEach(review => DBHelper.addReview(review))
      })
      .then(reviews => {
        return Promise.resolve(reviews);
      })
    })
    .catch(error => {
      console.log('No offline posts found...')
      console.log(error)
    });

  }; // END sendPostsToServer...

  /**
   * Fetch offline reviews from idb by restaurant id with proper error handling.
   */
  static async fetchOfflineReviewsByRestaurantId(restaurant, callback) {

    let reviews = []

    // open database
    await DBHelper.openDatabase().then(db => {

      // loop through items...
      const tx = db.transaction('reviews');
      tx.objectStore('reviews').getAll()
      .then(rs => {
        rs.forEach(review => {
          if (review.restaurant_id == restaurant) {
            console.log('Found matching review in db: ' + review);
            reviews.push(rs) // filter results
          }
        });
      })

      tx.complete
      return db
    })
    .then(db => {  
      // loop through any offline items...
      const tx = db.transaction('offline');
      tx.objectStore('offline').getAll()
      .then(rs => {
        rs.forEach(review => {
          if (review.restaurant_id == restaurant) {
            console.log('Found matching offline review in db: ' + review);
            reviews.push(review) // filter results
          }
        });
      })
      console.log(reviews)
      return tx.complete
    })

    // callback
    .then(() => {
      console.log('CALLBACK!')
      return callback(null, reviews)
    })

    // in case of any error
    .catch(e => {return callback(e, null)})
  };

  static async fetchReviewsByRestaurantId(id, db) {

    if(!navigator.onLine){
      return await DBHelper.fetchOfflineReviewsByRestaurantId(id, (error, reviews) => { // check for offline stored reviews...
        console.log(reviews);
        self.reviews = reviews;
        return self.reviews; // return reviews retrieved from idb...
      })
      .then(reviews => Promise.resolve(reviews));
    } else {
      
      return await fetch(`${DBHelper.DATABASE_URL}/reviews/?restaurant_id=${id}`) // fetch all reviews for restaurant...
        .then(response => response.json())  // return json data...
        .then(reviews => {
          const tx = db.transaction('reviews', 'readwrite'); // add each review...
          const os = tx.objectStore('reviews'); // set handle to object store...
          reviews.map(r => os.put(r)) // map over each review & add to object store...
          return tx.complete.then(() => reviews); // then return reviews...
        })
        .catch(async error => {
          const reviews_1 = await DBHelper.fetchOfflineReviewsByRestaurantId(id, (error_1, reviews) => {
            console.log('Error encountered while fetching reviews...looking for any offline stored reviews...', reviews);
            self.reviews = reviews;
            return self.reviews; // return reviews retrieved from idb...
          });
          return Promise.resolve(reviews_1);
        });

    } // END if...

  };
  

  /**
   * Map marker for a restaurant.
   */
   static mapMarkerForRestaurant(restaurant, map) {
    // https://leafletjs.com/reference-1.3.0.html#marker
    const marker = new L.marker([restaurant.latlng.lat, restaurant.latlng.lng],
      {title: restaurant.name,
      alt: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant)
      })
      marker.addTo(newMap);
    return marker;
  };

}