let restaurants,
  neighborhoods,
  cuisines
var newMap
var markers = []

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  initMap(); // added 
  fetchNeighborhoods();
  fetchCuisines();
  fetchReviews();
});

/**
 * Fetch all neighborhoods and set their HTML.
 */
fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) { // Got an error
      console.error(error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });
};

/**
 * Set neighborhoods HTML.
 */
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  const selectLen = neighborhoods.length + 1; // get length of neighborhoods object data
  neighborhoods.forEach((neighborhood, i) => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    // set aria set size & position in set
    option.setAttribute('aria-setsize', selectLen);
    option.setAttribute('aria-posinset', i+2);
    select.append(option);
  });
};

/**
 * Fetch all cuisines and set their HTML.
 */
fetchCuisines = () => {
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
};

/**
 * Fetch all reviews and set their HTML.
 */
fetchReviews = () => {
  DBHelper.fetchReviews((error, reviews) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.reviews = reviews;
    }
  });
};

/**
 * Set cuisines HTML.
 */
fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');
  const selectLen = cuisines.length + 1; // get length of cuisines object data
  cuisines.forEach((cuisine, i) => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    // set aria set size & position in set
    option.setAttribute('aria-setsize', selectLen);
    option.setAttribute('aria-posinset', i+2);
    select.append(option);
  });
};

/**
 * Initialize leaflet map, called from HTML.
 */
initMap = () => {
  self.newMap = L.map('map', {
        center: [40.722216, -73.987501],
        zoom: 12,
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

  // set tabindex to map element
  document.querySelector('#map').tabIndex = -1;

  updateRestaurants();
};


/**
 * Update page and map for current restaurants.
 */
updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
    if (error) { // Got an error!
      // console.error(error);
    } else {
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    }
  })
};

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
resetRestaurants = (restaurants) => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  if (self.markers) {
    self.markers.forEach(marker => marker.remove());
  }
  self.markers = [];
  self.restaurants = restaurants;
};

/**
 * Create all restaurants HTML and add them to the webpage.
 */
fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list');
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant));
  });
  addMarkersToMap();
};

/**
 * Create a listener for data to pass back to caller
 */
createListener = (data) => {
  if(data) {
    return () => {
      window.location = DBHelper.urlForRestaurant(data);
    }
  }
  return;
};

/**
 * Create restaurant HTML.
 */
createRestaurantHTML = (restaurant) => {
  const li = document.createElement('li');
  li.tabIndex = -1; // set tabindex
  // li.onclick = createListener(restaurant); // generate a listener for the li
  // // also add a listener for enter key for keyboard naviagation
  // li.addEventListener("keyup", (event) => {
  //   if (event.keyCode === 13) {
  //     console.log(event.keyCode);
  //     window.location = DBHelper.urlForRestaurant(restaurant);
  //   }
  // });

  // build image element to load to page
  const image = DBHelper.imageDataForRestaurant(restaurant);
  
  // add image to page
  li.append(image);

  const name = document.createElement('h2');
  name.innerHTML = restaurant.name;
  li.append(name);

  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  li.append(neighborhood);

  if (restaurant.address) {
    const address = document.createElement('p');
    address.innerHTML = restaurant.address.replace(',', ',<br/>');
    li.append(address);
  }

  const more = document.createElement('button');
  more.innerHTML = 'View Details';
  more.setAttribute('aria-label', 'View details for ' + restaurant.name); // add aria label for screen readers
  more.setAttribute('role', 'button'); 
  more.onclick = createListener(restaurant);
  li.append(more);

  const favorite = document.createElement('div');
  favorite.tabIndex = 0; // set tabindex
	favorite.innerHTML = '&hearts;';
  favorite.setAttribute('aria-label', 'Add ' + restaurant.name + ' as your favorite restaurant'); // add aria label for screen readers
  favorite.setAttribute('role', 'button'); 
  favorite.classList.add("favorite_btn");
	favorite.onclick = (e) => {
	  const isFavNow = !restaurant.is_favorite;
	  DBHelper.updateFavoriteStatus(restaurant.id, isFavNow);
	  restaurant.is_favorite = !restaurant.is_favorite
	  changeFavElementClass(favorite, restaurant.is_favorite)
  };
  favorite.addEventListener("keyup", (event) => {
      if (event.keyCode === 13) {
        const isFavNow = !restaurant.is_favorite;
        DBHelper.updateFavoriteStatus(restaurant.id, isFavNow);
        restaurant.is_favorite = !restaurant.is_favorite
        changeFavElementClass(favorite, restaurant.is_favorite)
      }
  });
	changeFavElementClass(favorite, restaurant.is_favorite)
	li.append(favorite);

  return li
};

changeFavElementClass = (el, fav) => {
	if (!fav) {
	  el.classList.remove('favorite_yes');
	  el.classList.add('favorite_no');
	  el.setAttribute('aria-label', 'mark as favorite');
  
	} else {
	  el.classList.remove('favorite_no');
	  el.classList.add('favorite_yes');
	  el.setAttribute('aria-label', 'remove favorite');
  
	}
};

/**
 * Add markers for current restaurants to the map.
 */
addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.newMap);
    marker.on("click", onClick);

    function onClick() {
      window.location.href = marker.options.url;
    }
    self.markers.push(marker);
  });

};