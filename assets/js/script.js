// Initialize and add the map
function initMap() {
    // The location of California
    const california = { lat: 36.778, lng: -119.417 };
    // The map, centered at California
    const map = new google.maps.Map(document.getElementById("map"), {
      zoom: 5,
      center: california,
    });
    // The marker, positioned at California
    const marker = new google.maps.Marker({
      position: california,
      map: map,
    });
  }
  
  window.initMap = initMap;