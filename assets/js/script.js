// Initialize and add the map
const markerPath =
  "https://developers.google.com/maps/documentation/javascript/images/marker_green";
let storedHistory = JSON.parse(localStorage.getItem("historyValue")) || [];
let historyEl = $("#history");

$("#clearHistory").on("click", () => {
  localStorage.clear();
  historyEl.empty();
});

// Backup to ensure it displays at most 15
for (var i = 0; i < 15; i++) {
  $("<div>").text(storedHistory[i]).appendTo(historyEl);
}

function initMap() {
  // Latitude and Longitude of United States
  const unitedstates = { lat: 37.0902, lng: -95.7129 };
  // The map, centered at United States
  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 4.2,
    center: unitedstates,
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

    // Hides the placeholder image and text
    $(".placeholderDesign").addClass("d-none");
    $(".placeholderText").addClass("d-none");

    let historyValue = places[0].formatted_address;
    storedHistory.unshift(historyValue);

    // Sets user input into local storage history after search
    localStorage.setItem(
      "historyValue",
      // Limits to 15 values in search history
      JSON.stringify(storedHistory.slice(0, 15))
    );

    $("<div>").text(historyValue).prependTo(historyEl);

    // Get the latitude and longitude of the entered location
    const location = places[0].geometry.location;

    // Search for campgrounds nearby the location
    const service = new google.maps.places.PlacesService(map);
    service.nearbySearch(
      {
        location: location,
        // Searches in a 50km radius
        radius: 50000,
        // Keyword gives more results than type
        keyword: "campground",
      },

      (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          clearResults(); // Clear any existing markers on the map on the lise TODO: fix the label rotation issue

          // Clear any existing markers on the map
          markers.forEach((marker) => {
            marker.setMap(null);
          });
          markers = [];

          // Creates a marker for each campground
          for (let i = 0; i < results.length; i++) {
            createMarker(results[i], map, i);
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

function createMarker(place, map, labelIndex) {
  const markerIcon = markerPath + labels[labelIndex++ % labels.length] + ".png";
  let marker = new google.maps.Marker({
    map: map,
    position: place.geometry.location,
    icon: markerIcon,
    animation: google.maps.Animation.DROP,
  });

  // Making a request to Google Places for additional details
  let service = new google.maps.places.PlacesService(map);
  let request = {
    placeId: place.place_id,
    fields: ["website", "formatted_phone_number", "rating"],
  };

  service.getDetails(request, function (placeDetails, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      const photoUrl =
        place.photos && place.photos.length > 0
          ? place.photos[0].getUrl()
          : "./assets/images/noImage.png";

      const websiteUrl = placeDetails.website ? placeDetails.website : "";
      const phoneNumber = placeDetails.formatted_phone_number
        ? placeDetails.formatted_phone_number
        : "N/A";
      const userRating = placeDetails.rating ? placeDetails.rating : "--";
      // Creating the card that information will be added into
      const $outerDiv = $("<div>").addClass("fadeIn placeCard mb-2");

      const $rowDiv = $("<div>").addClass("row g-0");

      const $imgDiv = $("<div>").addClass("col-md-4 col-sm-4 imgContainer");

      const $img = $("<img>")
        .attr("src", photoUrl)
        .addClass("rounded-start locationImage");

      const $cardBodyDiv = $("<div>")
        .addClass("col-md-8 col-sm-8")
        .addClass("placeCard-body");

      const $locationName = $("<h5>")
        .addClass("card-title locationName")
        .text(place.name);

      const $locationAddress = $("<p>")
        .addClass("card-text locationAddress")
        .text(place.vicinity);

      const $phoneIcon = $("<i>")
        .addClass("fa-solid fa-phone")
        .attr("aria-hidden", "true");

      const $locationContact = $("<p>")
        .addClass("card-text locationContact")
        .text(" " + phoneNumber);

      const $websiteLink = $("<a>")
        .attr({ href: websiteUrl, target: "_blank" })
        .text(" Website ")
        .toggleClass("d-none", websiteUrl === "");

      const $externalLinkIcon = $("<i>")
        .addClass("fa fa-external-link")
        .attr("aria-hidden", "true")
        .toggleClass("d-none", websiteUrl === "");

      const $locationRating = $("<p>")
        .addClass("card-text locationRating")
        .text(" User Rating: " + userRating + " / 5");

      $locationContact.prepend($phoneIcon);

      $websiteLink.append($externalLinkIcon);

      $locationContact.append($websiteLink);

      $cardBodyDiv
        .append($locationName)
        .append($locationAddress)
        .append($locationContact)
        .append($locationRating);

      $rowDiv.append($imgDiv).append($cardBodyDiv);

      $outerDiv.append($rowDiv);

      $imgDiv.append($img);

      $outerDiv.on("click", () => {
        map.setCenter(place.geometry.location);
        const infowindow = new google.maps.InfoWindow({
          content: "You are here",
          position: place.geometry.location,
          pixelOffset: new google.maps.Size(0, -32),
        });
        infowindow.open(map);
        setTimeout(() => {
          infowindow.close();
        }, 2000);
      });

      $(".placeContainer").append($outerDiv);
    }
  });

  // Listens for click on marker
  marker.addListener("click", () => {
    // Hide the previous active marker
    if (activeMarker) {
      activeMarker.infoWindow.close();
      activeMarker.setAnimation(null);
    }

    // Set marker as active
    activeMarker = marker;

    // Window for markers, just as a back up
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
    }

    // Creates info window and sets the content
    let infoWindow = new google.maps.InfoWindow({
      content: content,
    });
    marker.infoWindow = infoWindow;

    // Opens the info window
    infoWindow.open(map, marker);
  });

  markers.push(marker);
}

let markers = [];

function clearResults() {
  const results = document.getElementById("cardList");
  while (results.childNodes[0]) {
    results.removeChild(results.childNodes[0]);
  }
}
