// Initialize and add the map
const MARKER_PATH =
  "https://developers.google.com/maps/documentation/javascript/images/marker_green";

const history = document.querySelector("#history");
function loadLocalStorage() {
  const lastSearch = localStorage.getItem("lastSearch");
  if (lastSearch) {
    // $('#locationSearch').val(lastSearch);
    $("#lastSearch").text(lastSearch);
  }
}

history.appendChild(lastSearch);

loadLocalStorage();

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
      // TODO: add content: there's no result/ may adjust the redius to test
      return;
    }
    const lastSearch = places[0].formatted_address;
    localStorage.setItem("lastSearch", lastSearch);
    $("#lastSearch").text(lastSearch);
    // Get the latitude and longitude of the entered location
    const location = places[0].geometry.location;

    // Search for campgrounds nearby the location
    const service = new google.maps.places.PlacesService(map);
    service.nearbySearch(
      {
        location: location,
        // Searches in a 50km radius
        radius: 50000,
        keyword: "campground",
        // type: ["campground"]
      },
      (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          // Clear any existing markers
          markers.forEach((marker) => {
            marker.setMap(null);
          });
          markers = [];

          // Creates a marker for each campground
          for (let i = 0; i < results.length; i++) {
            createMarker(results[i], map);

            // const placesList = document.getElementById("places");
            // const li = document.createElement("li");
            // li.textContent = places.name;
            // placesList.appendChild(li);
            // li.addEventListener("click", () => {
            //   map.setCenter(places[i].geometry.location);
            // });
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

let labels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
let labelIndex = 0;

// const markerIcon = MARKER_PATH + labels[labelIndex++ % labels.length] + ".png";

function createMarker(place, map) {
  const markerIcon =
    MARKER_PATH + labels[labelIndex++ % labels.length] + ".png";
  let marker = new google.maps.Marker({
    map: map,
    position: place.geometry.location,
    icon: markerIcon,
  });
  
  let service = new google.maps.places.PlacesService(map);
  let request = {
      placeId: place.place_id,
      fields: ['website', 'formatted_phone_number']
    };
    
  service.getDetails(request, function(placeDetails, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      const photoUrl = place.photos && place.photos.length > 0 ? place.photos[0].getUrl({
        maxWidth: 150,
        maxHeight: 150
      }) : "No image available";
      const websiteUrl = placeDetails.website ? placeDetails.website : '';
      const phoneNumber = placeDetails.formatted_phone_number ? placeDetails.formatted_phone_number : '';
      var $outerDiv = $("<div>").attr("id", "resultLocation-2").addClass("card mb-2");
      var $rowDiv = $("<div>").addClass("row g-0");
      var $imgDiv = $("<div>").addClass("col-md-4 imgContainer");
      var $img = $("<img>").attr("src", photoUrl).addClass("rounded-start locationImage");
      var $cardBodyDiv = $("<div>").addClass("col-md-8").addClass("card-body");
      var $locationName = $("<h5>").addClass("card-title locationName").text(place.name);
      var $locationAddress = $("<p>").addClass("card-text locationAddress").text(place.vicinity);
      var $locationContact = $("<p>").addClass("card-text locationContact").text(phoneNumber);
      var $websiteLink = $("<a>").attr({"href": websiteUrl, "target": "_blank"}).text(" Website Homepage ");
      var $externalLinkIcon = $("<i>").addClass("fa fa-external-link").attr("aria-hidden", "true");
      $websiteLink.append($externalLinkIcon);

      $locationContact.append($websiteLink);
        $cardBodyDiv.append($locationName).append($locationAddress).append($locationContact);
          $rowDiv.append($imgDiv).append($cardBodyDiv);
            $outerDiv.append($rowDiv);
              $imgDiv.append($img);


    $outerDiv.on('click', function() {
      map.setCenter(place.geometry.location);
    });

      $(".placeContainer").append($outerDiv);
    }
  });
  

  const placesList = document.getElementById("places");
  const tr = document.createElement("tr");
  const iconTd = document.createElement("td");
  const nameTd = document.createElement("td");
  const icon = document.createElement("img");

  icon.src = markerIcon;
  icon.setAttribute("class", "placeIcon");

  nameTd.textContent = place.name + place.vicinity;

  iconTd.appendChild(icon);
  tr.appendChild(iconTd);
  tr.appendChild(nameTd);
  results.appendChild(tr);

  tr.addEventListener("click", () => {
    map.setCenter(place.geometry.location);
  });

  $('.card').on('click', function() {
    map.setCenter(place.geometry.location);
  });

  // Listens for click on marker
  marker.addListener("click", function () {
    // Hide the previous active marker
    if (activeMarker) {
      activeMarker.infoWindow.close();
      activeMarker.setAnimation(null);
    }

    // Set this marker as active
    activeMarker = marker;

    // Create info window content
    let content =
      "<strong>" +
      place.name +
      "</strong><br/>" +
      place.vicinity +
      "<br/>" +
      '<a href="https://www.google.com/maps/place/?q=place_id:' +
      place.place_id +
      '" target="_blank">View on Google Maps</a><br/>';

    if (place.photos && place.photos.length > 0) {
      const photoUrl = place.photos[0].getUrl({
        maxWidth: 150,
        maxHeight: 150,
      });
      content += '<img src="' + photoUrl + '"/><br/>';
    } else {
      content += "<em>No image available</em><br/>"; //TODO: add an image for no image result
    }

    // Creates info window and sets the content
    let infoWindow = new google.maps.InfoWindow({
      content: content,
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

function initialize() {
  initMap();
}
