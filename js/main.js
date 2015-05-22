"use strict";

// Set up Keen:
var client = new Keen({
  projectId: "555a3b7859949a3cbebcdd14",
  writeKey: "defd742c48f480be612762cfd06e107f01bbcf541ee0931fad1be783649dd7233d902723a7cf8c1f6b738f0b93709d16649404bd71df9d4944e345c5a3c1f29965bb5d1f6712664a9b2bae2ff74ce373c5f7e5436fd42ea992a856c5f6b206853ef204d9b610779425a05034970ee739",
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