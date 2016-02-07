
if (Meteor.isClient) {

  var directionsDisplay;
  var directionsService;
  var map;

  var MAP_ZOOM = 15;

  Meteor.startup(function() {

  });

  // This code only runs on the client
  Meteor.subscribe("tasks");

  Template.body.helpers({

  });

  Template.body.events({

  });

  Template.travelForm.events({
    "click .travelFormSubmit": function (event, template) {
      // Set the checked property to the opposite of its current value
      //alert(template.find(".fromPlace").value);
      Template.map_canvas.getdirection(template.find(".fromPlace").value,template.find(".toPlace").value);
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

        self.autorun(function() {
        var latLng = Geolocation.latLng();
        if (! latLng)
          return;

          var mapOptions = {
            center: new google.maps.LatLng(latLng.lat, latLng.lng),
            zoom: 10,
            mapTypeId: google.maps.MapTypeId.ROADMAP
          };
          var map = new google.maps.Map(document.getElementById("map_canvas"),mapOptions);
          directionsDisplay.setMap(map);

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
          }
        });
  }
}
