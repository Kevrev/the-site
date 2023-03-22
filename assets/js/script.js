// Initialize and add the map
    
function initMap() {
    // The location of California
    const california = { lat: 36.778, lng: -119.417 };
    // The map, centered at California
    const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 5,
    center: california,
    });

    var searchBox = new google.maps.places.SearchBox(
        document.getElementById("locationSearch")
      );
      google.maps.event.addListener(searchBox, "places_changed", function () {
        searchBox.set("map", null);
    
        var places = searchBox.getPlaces();
    
        var bounds = new google.maps.LatLngBounds();
        var i, place;
        for (i = 0; (place = places[i]); i++) {
          (function (place) {
            var marker = new google.maps.Marker({
              position: place.geometry.location,
            });
            marker.bindTo("map", searchBox, "map");
            google.maps.event.addListener(marker, "map_changed", function () {
              if (!this.getMap()) {
                this.unbindAll();
              }
            });
            bounds.extend(place.geometry.location);
          })(place);
        }
        map.fitBounds(bounds);
        searchBox.set("map", map);
        map.setZoom(Math.min(map.getZoom(), 12));
      });
 
}


 window.initMap = initMap;

 let autocomplete;
 function initAutocomplete () {
    autocomplete = new google.maps.places.Autocomplete(
        document.getElementById('locationSearch'),
        {
            types: ['(regions)'],
            componentRestrictions: {'country': ['US']},
            fields: ['place_id', 'geometry', 'name']
        });
 }


function initialize() {
   initMap();
   initAutocomplete();
}