"use strict";

var dataBase = new Firebase('https://sweltering-fire-9328.firebaseio.com/dfgdfg');
var locationsRef, map, activity, drawingManager;
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

$(function() {
  $('.load-campaign').on('click', function(){
    loadCampaigns();
  });
})

function loadCampaigns() {
  $('.add-shape').hide();
  // Clear the map of shapes
  for (var i=0; i<drawnShapes.length; i++) {
    drawnShapes[i].setMap(null);
  }

  if (map) {
    // Clear the map of boundaries
    map.data.forEach(function(feature) {
      map.data.remove(feature);
    });
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

   map = new google.maps.Map(document.getElementById('map-canvas'), {});

   // Load shapes
   locationsRef.once('value', function(snapshot){
     drawShapes(snapshot.val(), map);
   })

   enableDrawing(map);

   loadBoundary(campaign.boundaryData);
}

function loadBoundary(boundary) {
  $.ajax({
    url: boundary,
    success: function(data){
      var geoJSON = {
        type: "Feature",
        geometry: data
      }
      map.data.addGeoJson(geoJSON);
      zoom(map);

    }
  })

  map.data.setStyle({
    fillColor: 'green',
    fillOpacity: 0,
    strokeColor: '#000000',
    strokeOpacity: 0.5,
    strokeWeight: 2
  });
}

/**
 * Update a map's viewport to fit each geometry in a dataset
 * @param {google.maps.Map} map The map to adjust
 */
function zoom(map) {
  var bounds = new google.maps.LatLngBounds();
  map.data.forEach(function(feature) {
    processPoints(feature.getGeometry(), bounds.extend, bounds);
  });
  map.fitBounds(bounds);
}

/**
 * Process each point in a Geometry, regardless of how deep the points may lie.
 * @param {google.maps.Data.Geometry} geometry The structure to process
 * @param {function(google.maps.LatLng)} callback A function to call on each
 *     LatLng point encountered (e.g. Array.push)
 * @param {Object} thisArg The value of 'this' as provided to 'callback' (e.g.
 *     myArray)
 */
function processPoints(geometry, callback, thisArg) {
  if (geometry instanceof google.maps.LatLng) {
    callback.call(thisArg, geometry);
  } else if (geometry instanceof google.maps.Data.Point) {
    callback.call(thisArg, geometry.get());
  } else {
    geometry.getArray().forEach(function(g) {
      processPoints(g, callback, thisArg);
    });
  }
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



