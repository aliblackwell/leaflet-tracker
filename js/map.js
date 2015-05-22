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
    projectId: "555a3b7859949a3cbebcdd14",
    readKey: "ca228eead012bf11a4d1fd4dc230b4b71a0224d169dfb1df6b9c6b3a498cb63174516593eb4046673009bd98864966f9a41316816923fdc719c03f9302387512bb3c690beda7da7f35ef59901a4518631a61de3336141f57917f206a8ea5167af60c0bdf006e60d2706fee3adc7b91b4"
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