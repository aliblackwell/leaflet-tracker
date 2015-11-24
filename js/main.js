"use strict";

// Set up Keen:
var client = new Keen({
  projectId: "XXXX",
  writeKey: "XXXX",
  protocol: "http"
});

console.log(client);


if (navigator.geolocation) {
  savePosition();
  setInterval(savePosition, 30000);
} else {
  // TODO: add message letting user know they can add coords manually
}

function savePosition() {
  navigator.geolocation.getCurrentPosition(gotLocation, error);
}


function gotLocation(position) {

  console.log(position)

  // Create a data object with the properties you want to send
  var locationEvent = {
    keen: {
      timestamp: new Date().toISOString(),
      location: {
        coordinates: [position.coords.latitude, position.coords.longitude]
      }
    }
  };

  client.addEvent("locations", locationEvent, function(err, res){
    if (err) {
      console.log(err);
    }
    else {

    }
  });
}

function error(error) {
  console.log(error);
}