/**
 * Created by Ken on 8/17/2014.
 */

(function(ftcorral, google) {
    var url = 'http://foodtrucker.azurewebsites.net/TruckRESTService.svc/GetNearbyTrucks';
    var current = {
        pos: new google.maps.LatLng( 37.7749300, -122.4194200),
        zoom: 15,
        radius: 1
    };

    var cityLimit = 20;
    var map;
    var markers = [];

    // Get nearby food trucks from a lat, long position in (radius) miles
    function getNearbyTrucks(lat, lng, radius) {
        var locUrl = url + '?lat=' + lat +'&lng=' + lng + '&radius=' + radius;

        $.getJSON(locUrl, function(data) {
            $.each(data, function(i, entry) {
                createMarker(entry);
            });
        })
    }

    // Initialize Google map
    function initialize() {

        // Create map
        var mapOptions = {
            center: current.pos,
            zoom: current.zoom
        };
        map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);

        // Get current geolocation (if able)
        getInitLocation();
    }

    // Get the starting location
    function getInitLocation() {

        // Try HTML5 geolocation
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                // Update if geoLocation is near SF
                if (distance(current.pos.latitude, current.pos.longitude, position.coords.latitude, position.coords.longitude, 'M') < cityLimit) {

                    current.pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                    map.setCenter(pos);
                }
                updateTrucks();
            }, function() { updateTrucks() });
        // Browser doesn't support Geolocation. Keep default location
        } else {
            updateTrucks();
        }
    }


    // Get nearby trucks and update markers
    function updateTrucks() {

        // Clear out existing markers
        for (var i = 0; i < markers.length; i++) {
            markers[i].setMap(null);
        }
        markers = [];

        // Create a marker for current location
        var marker = new google.maps.Marker({
            position: current.pos,
            map: map,
            draggable:true,
            animation: google.maps.Animation.DROP,
            icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
        });
        google.maps.event.addListener(marker, 'dragend', function()
        {
            current.pos = marker.getPosition();
            updateTrucks();
        });
        markers.push(marker);

        // Get all nearby food trucks then create markers for them
        getNearbyTrucks(current.pos.lat(), current.pos.lng(), current.radius);
    }

    // Create a marker for a food truck
    function createMarker(entry) {

        var infowindow = new google.maps.InfoWindow({
            content: createContentString(entry)
        });

        // Create a marker for the user's current location (or where they moved the marker)
        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(entry.location.latitude,
                                             entry.location.longitude),
            map: map,
            title: location.applicant,
            icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
        });

        google.maps.event.addListener(marker, 'click', function() {
            infowindow.open(map,marker);
        });

        markers.push(marker);
    }

    function createContentString(entry) {
        var content =
        '<div class="infoContent">' +
        '<h3>' + entry.applicant + '</h3>' +
        '<h4>' + entry.fooditems + '</h4>';

        if (entry.address !== undefined)
            content += '<p><b>Address</b>:' + entry.address + '<br/>' +
                entry.locationdescription + '<br/>';
        if (entry.schedule !== undefined)
            content += '<p><a href="' + entry.schedule + '"><b>Schedule</b></a></p>';

        return content;
    }

    google.maps.event.addDomListener(window, 'load', initialize());
} (ftcorral = window.ftc || {}, google));
