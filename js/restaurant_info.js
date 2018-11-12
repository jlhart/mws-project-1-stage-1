let restaurant;
var newMap;

/**
 * Initialize map as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {  
  initMap();
});

/**
 * Initialize leaflet map
 */
initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {      
      self.newMap = L.map('map', {
        center: [restaurant.latlng.lat, restaurant.latlng.lng],
        zoom: 16,
        scrollWheelZoom: false
      });
      L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
        mapboxToken: 'pk.eyJ1IjoiamxoYXJ0IiwiYSI6ImNqbmJzeXg1eTJkMDUzcG52bTV3eno5cDIifQ.P6v9dpZY_1MV5tpp1wk0WQ',
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
          '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
          'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox.streets'    
      }).addTo(newMap);
      document.querySelector('#map').tabIndex= -1;
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.newMap);
    }
  });
}  
 

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant)
    });
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  // const db = DBHelper.openDatabase();
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;
  
  // add attributes to name for accessibility
  name.setAttribute('aria-label', restaurant.name);
  name.tabIndex = 0;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  // add attributes to address for accessibility
  address.setAttribute('aria-label', 'address');
  address.tabIndex = 0;

  // build image element to load to page
  const image = DBHelper.imageDataForRestaurant(restaurant);
  
  // setup the id to match image placeholder for css...
  image.id = 'restaurant-img';

  // get the image placeholder and replace it with the new image
  document.getElementById('restaurant-img').replaceWith(image); 
  
  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }

  // if (!db) db = DBHelper.openDatabase() // open idb if it was not passed...
    // ...then...with db...
    DBHelper.openDatabase().then(db => {
      DBHelper.fetchReviewsByRestaurantId(restaurant.id, db) // get all reviews for this restaurant...
      .then((reviews) => {
        // if (!reviews) {
        //   console.log((reviews === undefined) ? 'No Reviews were found in IndexedDb!' : reviews);
        //   return;
        // }
        self.restaurant.reviews = reviews;
        fillReviewsHTML();  // add review html to page...
      });
    });
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key].replace(/, /g, ',<br/>');
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h3');
  title.innerHTML = 'Reviews';
  title.tabIndex = 0;
  container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'Be the first to review this restaurant!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');
  const name = document.createElement('p');
  name.innerHTML = review.name;
  li.appendChild(name);
  li.tabIndex = 0;

  const rating = document.createElement('p');
  rating.innerHTML = `<span aria-label="${review.rating} Star Rating"> Rating: ` + 
                        `<span aria-hidden="true" class="fa fa-star checked"></span>`.repeat(review.rating) + 
                     `</span>`;
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
}

/**
 * Form validation & submission
 */
addReview = () => {
  event.preventDefault(); // prevent the default action of the form submission...
  
  let restaurantId = getParameterByName('id');
  let name = document.getElementById('name').value;
  let rating;
  let comments = document.getElementById('comments').value;
  rating = document.querySelector('#rating option:checked').value;
  const review = [name, rating, comments, restaurantId];

  // Add data to DOM
  const frontEndReview = {
    restaurant_id: parseInt(review[3]),
    rating: parseInt(review[1]),
    name: review[0],
    comments: review[2].substring(0, 300),
    createdAt: new Date()
  };

  // console.log('DOM added review: '. frontEndReview);

  // Send review to backend
  DBHelper.addReview(frontEndReview);
  addReviewHTML(frontEndReview);
  document.getElementById('review').reset();
}

addReviewHTML = (review) => {
  if (document.getElementById('no-review')) {
      document.getElementById('no-review').remove();
  }
  const container = document.getElementById('reviews-container');
  const ul = document.getElementById('reviews-list');

  //insert the new review on top
  ul.insertBefore(createReviewHTML(review), ul.firstChild);
  container.appendChild(ul);
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

if('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', event => {
    if(event.data.msg === 'ONLINE') {
      console.log('Connection is: ' + event.data.msg + ', Sending any offline Posts to server...');
      DBHelper.sendPostsToServer();
    }
  });
}