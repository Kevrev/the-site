// Initialize and add the map
    
function initMap() {
    
    // The location of California
    const california = { lat: 36.778, lng: -119.417 };
    // The map, centered at California
    const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 5,
    center: california,
    });


// This is creating the searchbox
let searchBox = new google.maps.places.SearchBox(
    document.getElementById("locationSearch")
    );

// Fires when an input is made or prediction is picked   
    google.maps.event.addListener(searchBox, "places_changed", () => {
    const places = searchBox.getPlaces();

    if (places.length === 0) {
        return;
    }

    // Get the latitude and longitude of the entered location
    const location = places[0].geometry.location;

    // Search for ski resorts nearby the location
    const service = new google.maps.places.PlacesService(map);
    service.nearbySearch(
        {
        location: location,
        // Searches in a 50km radius
        radius: 50000,
        keyword: "ski resort",
        },
        (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            // Clear any existing markers
            markers.forEach((marker) => {
            marker.setMap(null);
            });
            markers = [];

            // Creats a marker for each ski resort
            for (let i = 0; i < results.length; i++) {
            createMarker(results[i], map);
            }

            // Fits the map to the bounds of the markers
            const bounds = new google.maps.LatLngBounds();
            markers.forEach((marker) => {
            bounds.extend(marker.getPosition());
            });
            map.fitBounds(bounds);
        }
       }
    );
 });
}

    
let activeMarker = null;

function createMarker(place, map) {
  let marker = new google.maps.Marker({
    map: map,
    position: place.geometry.location
  });
  
  // Listens for click on marker
  marker.addListener('click', function() {
    // Hide the previous active marker
    if (activeMarker) {
      activeMarker.infoWindow.close();
      activeMarker.setAnimation(null);
    }

    // Set this marker as active
    activeMarker = marker;

    // Create info window content
    let content = '<strong>' + place.name + '</strong><br/>' +
    place.vicinity + '<br/>' +
    '<a href="https://www.google.com/maps/place/?q=place_id:' + place.place_id + '" target="_blank">View on Google Maps</a><br/>';

    if (place.photos && place.photos.length > 0) {
    const photoUrl = place.photos[0].getUrl({
        maxWidth: 150,
        maxHeight: 150
    });
        content += '<img src="' + photoUrl + '"/><br/>';
    } else {
        content += '<em>No image available</em><br/>';
    }

    // Creates info window and sets the content
    let infoWindow = new google.maps.InfoWindow({
        content: content
      });
      marker.infoWindow = infoWindow;
  
      // Opens the info window
      infoWindow.open(map, marker);
  
      // Get additional details for the place
      let service = new google.maps.places.PlacesService(map);
      let request = {
        placeId: place.place_id,
        fields: ['website', 'formatted_phone_number']
      };
  
      service.getDetails(request, function(placeDetails, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          const infoDiv = $('#info-1');
          const photoUrl = place.photos && place.photos.length > 0 ? place.photos[0].getUrl({
            maxWidth: 150,
            maxHeight: 150
          }) : "No image available";
          const websiteUrl = placeDetails.website ? placeDetails.website : '';
          const phoneNumber = placeDetails.formatted_phone_number ? placeDetails.formatted_phone_number : '';
          infoContent = '<h2>' + place.name + '</h2>' +
                        '<img src="' + photoUrl + '" alt="' + place.name + '"/>' +
                        '<p>' + place.vicinity + '</p>' +
                        '<p>' + websiteUrl + '</p>' +
                        '<p>' + phoneNumber + '</p>';
  
          infoDiv.children().find('.locationName').html(infoContent);
        }
      });
    });
  
    markers.push(marker);
  }

let markers = [];   

// let autocomplete;
// function initAutocomplete () {
//     autocomplete = new google.maps.places.Autocomplete(
//         document.getElementById('locationSearch'),
//         {
//             types: ['(regions)'],
//             componentRestrictions: {'country': ['US']},
//             fields: ['place_id', 'geometry', 'name']
//         });
// }


function initialize() {
   initMap();
   initAutocomplete();
}