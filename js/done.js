"use strict";

var dataBase = new Firebase('https://sweltering-fire-9328.firebaseio.com/dfgdfg');
var locationsRef, map, boundariesRef, activity, drawingManager;
var drawnShapes = [];

// Campaign info will eventually come from Firebase
var campaigns = [
  {
    candidate: 'Kirsty Chestnutt',
    boundaryData: 'http://mapit.mysociety.org/area/144376.geojson',
    locationData: 'https://sweltering-fire-9328.firebaseio.com/kch1'
  },{
    candidate: 'John Foster',
    boundaryData: 'http://mapit.mysociety.org/area/2506.geojson',
    locationData: 'https://sweltering-fire-9328.firebaseio.com/jf1'
  }
];

function initialize() {
  var mapOptions = {
    center: new google.maps.LatLng(51.5291832,-0.0270462),
    zoom: 14
  };
  map = new google.maps.Map(document.getElementById('map-canvas'),
    mapOptions);
  $('#load-campaign').on('click', function(){
    loadCampaigns();
  });
}

google.maps.event.addDomListener(window, 'load', initialize);

function loadCampaigns() {
  $('.add-shape').hide();
  // Clear the map
  for (var i=0; i<drawnShapes.length; i++) {
    drawnShapes[i].setMap(null);
  }
  // Load the campaign template
  var theTemplateScript = $("#campaign-template").html();
  var theTemplate = Handlebars.compile(theTemplateScript);
  $.each(campaigns, function(i, campaign){
    var context = campaign;
    context.index = i;
    // Pass our data to the template
    var theCompiledHtml = theTemplate(context);
    // Add the compiled html to the page
    $('#controls ul').append(theCompiledHtml);
  });
  $('.campaign').on('click', function(){
    chooseCampaign(this);
  });
}

function chooseCampaign(el) {
  $('.campaign').hide();
   var campaign = campaigns[$(el).attr('data-campaign-index')];
   locationsRef = new Firebase(campaign.locationData);
   // Load shapes
   locationsRef.once('value', function(snapshot){
     drawShapes(snapshot.val(), map);
   })

   enableDrawing(map);

}




function enableDrawing(map) {
  $('.add-shape').show();
  // Add an event to each of the buttons:
  $('.add-shape').on('click', function(){
    var activityType = $(this).attr('id');
    loadDrawingManager(map, activityType);
  })
}

function loadDrawingManager(map, activity) {
  console.log(activity)
  if (drawingManager) {
    drawingManager.setMap(null);
  }

  var polygonOptions = getPolygonOptions(activity);
  polygonOptions.editable = true;

  drawingManager = new google.maps.drawing.DrawingManager({
    drawingMode: google.maps.drawing.OverlayType.POLYGON,
    drawingControl: true,
    drawingControlOptions: {
      position: google.maps.ControlPosition.TOP_CENTER,
      drawingModes: [
        google.maps.drawing.OverlayType.POLYGON
      ]
    },
    polygonOptions: polygonOptions
  });
  drawingManager.setMap(map);

  google.maps.event.addListener(drawingManager, 'overlaycomplete', function(event) {
    if (event.type == google.maps.drawing.OverlayType.POLYGON) {

      setEvents(event.overlay);
      addShapeToArray(event.overlay);

      var newShape = {
        points: event.overlay.getPath().getArray(),
        activity: activity
      }
      saveShape(newShape);
    }
  });
}




function saveShape(shape) {
  locationsRef.push(shape, function(error){
    if (error) {
      console.log(error);
    } else {
      showSaved();
    }
  });

}




function drawShapes(list, map) {
  _.each(list, function(location, dbId){
    console.log(location)
    var triangleCoords = [];
    for (var i=0; i<location.points.length; i++) {
      triangleCoords.push(new google.maps.LatLng(location.points[i].A, location.points[i].F))
    }

    // Construct the polygon.
    var options = getPolygonOptions(location.activity);
    options.paths = triangleCoords;
    options.dbId = dbId;
    var newShape = new google.maps.Polygon(options);

    newShape.setMap(map);
    addShapeToArray(newShape);

    setEvents(newShape);
  })
}

function setEvents(shape) {
  google.maps.event.addListener(shape, 'click', function(event) {
    // delete shape
    shape.setMap(null);
    removeShapeFromArray(shape);
    if (shape.dbId) {
      var shapeRef = locationsRef.child(shape.dbId);
      shapeRef.remove()
    }
  })
}

function setColour(activityType) {
  return activityType == 'canvassing' ? '#ff0000' : (activityType == 'leafleting' ? '#ffff00' : '#ffffff');
}

function getPolygonOptions(activity) {
  var options = {
      strokeColor: '#000000',
      strokeOpacity: 0.5,
      strokeWeight: 1,
      fillColor: setColour(activity),
      fillOpacity: 0.35
    }
  return options;
}

function showSaved() {
  $('#saved').fadeIn(500, function(){
    $(this).fadeOut(500);
  })
}

function addShapeToArray(shape) {
  drawnShapes.push(shape);
}

function removeShapeFromArray(shape) {
  drawnShapes = _.without(drawnShapes, shape);
}



