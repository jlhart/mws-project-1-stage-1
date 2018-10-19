/**
 * Common database helper functions.
 */
class DBHelper {

  /**
   *  Open the Indexed Db store
   */
  static openDatabase() {
    return idb.open('mws-restaurant-jlhart', 1, db => {

      switch (db.oldVersion) {
        case 0:
          let restaurantStore = db.createObjectStore('restaurants', { keyPath: 'id' })
          let cuisineStore = db.createObjectStore('cuisines', { unique: true})
          let neighborhoodStore = db.createObjectStore('neighborhoods', { unique: true})
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
  }

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337 // Change this to your server port
    return `http://localhost:${port}/restaurants`;
  }

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
          return fetch(DBHelper.DATABASE_URL) // call DB for more...

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
        return fetch(`${DBHelper.DATABASE_URL}/${id}`)
        .then(data => data.json())
        .then(restaurant => callback(null, restaurant))

      // success
      callback(null, restaurant)
    })

    // catch errors
    .catch(e => callback(e, null))
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {

    let restaurants = []

    // open database
    DBHelper.openDatabase(db => {

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
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {

    let restaurants = []

    // open database
    DBHelper.openDatabase(db => {

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
  }

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
  }

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
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // open database
    DBHelper.openDatabase()


    // get by neighborhood index
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
  }

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
  }

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
  }
  /* static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  } */

}