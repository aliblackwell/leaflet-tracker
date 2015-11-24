"use strict";

var map, bounds;

google.maps.event.addDomListener(window, "load", function() {

  bounds = new google.maps.LatLngBounds ();
  map = new google.maps.Map(document.getElementById("map-canvas"), {
    center: new google.maps.LatLng(0, 0),
    zoom: 2
  });

  // Create a client instance
  var client = new Keen({
    projectId: "XXXX",
    readKey: "XXXX"
  });

  var extraction = new Keen.Query("extraction", {
    eventCollection: "locations"
  });

  // Send query
  client.run(extraction, function(err, response){
    if (err) {
      // there was an error!
    }
    else {
      plotMarkers(response);
    }
  });

});

function plotMarkers(response) {
  var locations = response.result;
  for (var i = 0; i < locations.length; i++) {
    (function(){
      if (locations[i] !== undefined && locations[i] !== null) {
        console.log(locations[i])
        var latlng = new google.maps.LatLng(locations[i].keen.location.coordinates[0], locations[i].keen.location.coordinates[1]);
        var marker = new google.maps.Marker({
          position: latlng,
          map: map
        });
        bounds.extend(latlng);
      }
    })();
    map.fitBounds(bounds);
  }
}

google.maps.event.addListener(map, "click", function(event) {
   placeMarker(event.latLng);
});

function placeMarker(location) {
    var marker = new google.maps.Marker({
        position: location,
        map: map
    });
    console.log(marker);
}