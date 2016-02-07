
if (Meteor.isClient) {

  var directionsDisplay;
  //var directionsService;
  var map;
  var routeBoxer = null;
  var gmarkers = [];
  var startTime = null;
  var duration = 0;
  var sampler = 0;
  var searchType = "car_repair";

  var MAP_ZOOM = 15;

  Meteor.startup(function() {

  });

  // This code only runs on the client
  Meteor.subscribe("tasks");

  Template.body.helpers({

  });

  Template.body.events({
    "submit .typeSearch": function (event,template){
      searchType = template.find(".type").value;
      directionsDisplay = new google.maps.DirectionsRenderer();
      Template.map_canvas.getdirection(fromPlace,toPlace);
      return false;
    }

  });

  Template.travelForm.events({
    "click .travelFormSubmit": function (event, template) {
      // Set the checked property to the opposite of its current value
      //alert(template.find(".fromPlace").value);
      Template.map_canvas.getdirection(template.find(".fromPlace").value,template.find(".toPlace").value);
      fromPlace = template.find(".fromPlace").value;
      toPlace = template.find(".toPlace").value;
      sampler = template.find(".sampler").value;
      startTime = template.find(".startTime").value;
      return false;
    }
  });

  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });


  Template.map_canvas.onCreated(function() {
    self = this;
      directionsDisplay = new google.maps.DirectionsRenderer();
      // Create and move the marker when latLng changes.
        routeBoxer = new RouteBoxer();
        self.autorun(function() {
        var latLng = Geolocation.latLng();
        if (! latLng)
          return;

          var mapOptions = {

              center: new google.maps.LatLng(latLng.lat, latLng.lng),
              zoom: 10,
              mapTypeId: google.maps.MapTypeId.ROADMAP
            };
            map = new google.maps.Map(document.getElementById("map_canvas"),mapOptions);
            directionsDisplay.setMap(map);

            directionService = new google.maps.DirectionsService();
            directionsRenderer = new google.maps.DirectionsRenderer({ map: map });
            var marker = new google.maps.Marker({
                    position: latLng,
                    setMap: map_canvas,
                    //etVisible: true
         });

         map.setCenter(marker.getPosition());
         map.setZoom(MAP_ZOOM);
      });
  });

  Template.map_canvas.getdirection = function(start,end) {
    directionsService = new google.maps.DirectionsService();
        var request = {
            origin:start,
            destination:end,
            travelMode: google.maps.DirectionsTravelMode.DRIVING
        };
        directionsService.route(request, function(response, status) {
          if (status == google.maps.DirectionsStatus.OK) {
            directionsDisplay.setDirections(response);
            duration = response.routes[0].legs[0].duration.value/3600;;
            var path = response.routes[0].overview_path;
            var boxes = routeBoxer.box(path, sampler);
            Template.map_canvas.drawBoxes(boxes);
            Template.map_canvas.findPlaces(boxes,0,searchType);
          }
        });
  }

    Template.map_canvas.testPlaceDetails = function(placeId,startTime,endTime) {
      /*
      var mapOptions = {
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        zoom: 8
      };
      var map1 = new google.maps.Map(document.getElementById("map_canvas1"), mapOptions);
      var service = new google.maps.places.PlacesService(map1);
      var request = {
        placeId: placeId
      };
       service.getDetails(request, function (results, status) {
       });*/
       return true;
    }

    // Draw the array of boxes as polylines on the map
 Template.map_canvas.drawBoxes = function(boxes) {
  boxpolys = new Array(boxes.length);
  for (var i = 0; i < boxes.length; i++) {
    boxpolys[i] = new google.maps.Rectangle({
      bounds: boxes[i],
      fillOpacity: 0,
      strokeOpacity: 1.0,
      strokeColor: '#000000',
      strokeWeight: 1,
      map: map
    });
  }
}


Template.map_canvas.findPlaces = function(boxes,searchIndex,searchType) {
   var request = {
       bounds: boxes[searchIndex],
       types: [searchType]
   };
   // alert(request.bounds);
   var mapOptions = {
     mapTypeId: google.maps.MapTypeId.ROADMAP,
     zoom: 8
   };
   var service = new google.maps.places.PlacesService(map);
   service.radarSearch(request, function (results, status) {
   if (status != google.maps.places.PlacesServiceStatus.OK) {
     return;
   }
   var endTime = parseInt(startTime) + duration;
   for (var i = 0, result; result = results[i]; i++) {
     if(Template.map_canvas.testPlaceDetails(result.place_id,startTime,endTime))
     var marker = Template.map_canvas.createMarker(result);
   }
   searchIndex++;
   if (searchIndex < boxes.length)
     Template.map_canvas.findPlaces(boxes,searchIndex);
   });
}

// Clear boxes currently on the map
 Template.map_canvas.clearBoxes = function() {
  if (boxpolys != null) {
    for (var i = 0; i < boxpolys.length; i++) {
      boxpolys[i].setMap(null);
    }
  }
  boxpolys = null;
}

Template.map_canvas.createMarker = function(place){
    var placeLoc=place.geometry.location;
    if (place.icon) {
      var image = new google.maps.MarkerImage(
                place.icon, new google.maps.Size(71, 71),
                new google.maps.Point(0, 0), new google.maps.Point(17, 34),
                new google.maps.Size(25, 25));
     } else var image = null;

    var marker=new google.maps.Marker({
        map:map,
        icon: image,
        position:place.geometry.location
    });
    gmarkers.push(marker);
}






}
