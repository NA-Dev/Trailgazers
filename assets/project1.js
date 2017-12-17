
// stores data from hiking project
// data comes from getTrails()
var trails = {};

// stores searched location data
// data comes from geocode()
// geolocate() data used if available
var geoData = {};

// locations of top rated trails
// used as placeholders on page load
var placeholder = [
	{lat: 37.2928, lng: -113.0081},
	{lat: 40.2340, lng: -105.6419},
	{lat: 40.3710, lng: -105.6419},
];

// needed for initAutocomplete
// some things do not work if not global
var placeSearch;
var componentForm = { };


// Get user name and location
$(document).ready(function() {
	console.log("document.ready");

	showRandom();

	geolocate();

	$("#address-submit").on("click", function() {

		var address = $("#address-input").val().trim();
		geocode(address);
	});

	$(".search-results").on("click", "img", showDetails);

	$("body").on("click", ".directionButtonClass", function(event) {
		var spefLat = $(this).attr("data-lat");
		var spefLng = $(this).attr("data-lng");
		var spefName = $(this).attr("data-name");

		var url = "https://www.google.com/maps/dir/?api=1";
		//var origin = "&origin=" + tempLatitude + "," + tempLongitude;
		var destination = "&destination=" + spefName;
		var newUrl = new URL(url  + destination);

		window.open(newUrl , "_blank");
	});
});



// Google Maps API
// executes upon search submit
// gets lat, lng, place_id
// sends results to getTrails()
function geocode(address) {
	event.preventDefault();

	console.log("geocode: " + address);

	var queryURL = "https://maps.googleapis.com/maps/api/geocode/json?key=";

	queryURL += keyMaps + "&address=" + address;

	$.ajax({
		url: queryURL,
		method: 'GET'
	}).done(function(response) {
		var status = response.status;
		if (status === "OK") {

			var resultRef = response.results[0];
			var place_id = resultRef.place_id;
			var formatted_address = resultRef.formatted_address;

			var locationRef = resultRef.geometry.location;
			var lat = locationRef.lat;
			var lng = locationRef.lng;

			geoData = {
				"lat": lat,
				"lng": lng,
				"place_id": place_id,
				"address": formatted_address
			};

			getTrails(lat, lng);

		} else {
			alert('Geocode unsuccessful.');
		}
	});

	//May want to validate response somehow later
}

// executes upon page load
// shows random place results
function showRandom() {
	console.log("showRandom");

	var rand = Math.floor(Math.random()*placeholder.length);
	var lat = placeholder[rand].lat;
	var lng = placeholder[rand].lng;

	getTrails(lat, lng);
}

// executes when result img clicked
// generates details card HTML
function showDetails() {
	console.log("showDetails");

	var index = $(this).data("index");

	$.each(trails[index], function populate(key, value) {

		if ( $(`#trail-${key}`) ) {
			$(`#trail-${key}`).text(value);
		}

		if ( ($(`#trail-${key}`)) && (key.startsWith("img")) ) {

			var source = $(`#trail-${key}`).attr("src");

			if (!(source === "")) {

				$(`#trail-${key}`).attr("src", value);

			} else if (source === "") {

				$(`#trail-${key}`).attr("src", randomImages);
			}
		}
	});
}

// Firebase database
	// Initialize Firebase
	var config = {
	    apiKey: "AIzaSyDgCGQByTB-VEChXM6Dssa_Xir_EcGJHJA",
	    authDomain: "class-project-trails-api.firebaseapp.com",
	    databaseURL: "https://class-project-trails-api.firebaseio.com",
	    projectId: "class-project-trails-api",
	    storageBucket: "class-project-trails-api.appspot.com",
	    messagingSenderId: "334324080267"
	};

	if (firebase.apps.length === 0){
	firebase.initializeApp(config);
	}

	// Get a reference to the database service
	var database = firebase.database();

	database.ref().on("child_added", function(childSnapshot, prevChildKey) {

	    var newFavTrail = childSnapshot.val().name;
	    var site = childSnapshot.val().site;

	    $("#favorite-list").append("<li> <a href=" + site + ">" + newFavTrail + "</a> </li>");

	});
// saves clicked item to favorites
// pushes to Firebase
function saveToFavorites(event) {
	console.log(saveToFavorites);

    event.preventDefault();

    var i = $(this).data('index');
    var favoriteHike = trails[i].name;
    var url = trails[i].url;

    var newFavTrail = {
      name: favoriteHike,
      site: url
    };

    database.ref().push(newFavTrail);
}

// REI Hiking Project API
// source of hiking trail data
function getTrails(lat, lng) {
	console.log("getTrails of " + lat + ", " + lng);

	var queryURL = "https://www.hikingproject.com/data/get-trails?key=";

	queryURL += keyTrails + "&lat=" + lat + "&lon=" + lng + "maxDistance=10";

	var milesRadius = "&maxDistance=10";

	var sourceSelect = $("#source");

	if(sourceSelect.val() === "10 Miles" ) {
    		milesRadius = "&maxDistance=10";
    }

    if(sourceSelect.val() === "20 Miles" ) {
    		milesRadius = "&maxDistance=20";
    }

    if(sourceSelect.val() === "30 Miles" ) {
    		milesRadius = "&maxDistance=30";
    }

	if(sourceSelect.val() === "40 Miles" ) {
    		milesRadius = "&maxDistance=40";
    }

	if(sourceSelect.val() === "50 Miles" ) {
    		milesRadius = "&maxDistance=50";
    }

	if(sourceSelect.val() === "60 Miles" ) {
    		milesRadius = "&maxDistance=60";
    }

	if(sourceSelect.val() === "70 Miles" ) {
    		milesRadius = "&maxDistance=70";
    }

	if(sourceSelect.val() === "80 Miles" ) {
    		milesRadius = "&maxDistance=80";
    }

	if(sourceSelect.val() === "90 Miles" ) {
    		milesRadius = "&maxDistance=90";
    }

	if(sourceSelect.val() === "100 Miles" ) {
    		milesRadius = "&maxDistance=100";
    }

	queryURL += keyTrails + "&lat=" + lat + "&lon=" + lng + milesRadius + "&maxResults=50//";

	$.ajax({
		url: queryURL,
		method: 'GET'
	}).done(function(response) {
		var status = response.success;
		if (status === 1) {

			trails = response.trails;

			setLocalStorage("trails", trails);

			renderCards();

		} else {
			alert("Trails query unsuccessful.");
		}
	});

	//May want to validate response somehow later
}

// generates dynamic HTML from results
// fills in placeholder if img not available
function renderCards() {
	console.log("renderCards");

	$("#resultList").empty();

	for (i = 0; i < trails.length; i++) {

		var card = $("<div>");
		var image = $("<img>");
		var nameDiv = $('<div class="name">');
		var lengthDiv = $('<div class="length">');
		var difficultyDiv = $('<div class="difficulty">');
		var directionButton= $("<button>");
		var favoriteButton = $("<button>");

		card.addClass("imgDiv col-xs-12 col-sm-12 col-md-6 col-lg-4 col-xl-3");
		image.attr("src", trails[i].imgMedium);
		image.attr("alt", trails[i].name);
		image.data("index", i);
		nameDiv.text(trails[i].name);
		lengthDiv.text(trails[i].length);
		difficultyDiv.text(trails[i].difficulty);
		directionButton.text("Get Directions");
		directionButton.addClass("directionButtonClass");
		directionButton.attr("data-lat", trails[i].latitude);
		directionButton.attr("data-lng", trails[i].longitude);
		directionButton.attr("data-name", trails[i].name);
		favoriteButton.text("Favorite");
		favoriteButton.addClass("favorite-button");
		favoriteButton.data("index", i);
		favoriteButton.on('click', saveToFavorites);

		if (image.attr("src") === "") {

			var imagesArray = ["http://www.visitbitterrootvalley.com/wp-content/uploads/2014/10/hiking-pano-bear-creek.jpg", "https://www.pigeonforge.com/wp-content/uploads/bote-500.jpg", "https://www.nps.gov/common/uploads/grid_builder/akr/crop16_9/FD49899A-1DD8-B71B-0BD128907FBB8C3A.jpg?width=950&quality=90&mode=crop", "https://s3-us-east-2.amazonaws.com/visitdetroit-useast2-ohio/content/uploads/2017/05/17102109/wsi-imageoptim-hiking-trails-1300x865.jpg", "http://media.montalvoarts.org/uploads/images/2010/October/img_1589%20(Modified)1726.jpg", "https://www.nps.gov/slbe/planyourvisit/images/fall_trail.jpg", "http://greerarizona.com/wp-content/themes/prototype-greer/images/hike/01_hiking_trails.jpg", "https://www.mtcharlestonresort.com/images/gallery/hike-ski/mtchaz_hiking_6.jpg", "http://www.uniquelyminnesota.com/images/mn-hiking-0530.jpg", "http://cdn.boulevards.com/files/2014/07/best-hikes-in-santa-cruz1.jpg", "https://glengordonmanor.com/wp-content/uploads/2017/09/Marys-Rock.jpg"];

			var randomImages = imagesArray[Math.floor(imagesArray.length * Math.random())];

			image.attr("src", randomImages);
		}

		card.append(image);
		card.append(nameDiv);
		card.append(lengthDiv);
		card.append(difficultyDiv);
		card.append(directionButton);
		card.append(favoriteButton);

		$("#resultList").append(card);
	}

	$(".search-results img").first().click();
}

// Google Maps Places API
// used to fillInAddress
function initAutocomplete() {

	autocomplete = new google.maps.places.Autocomplete(
		(document.getElementById('address-input')),
	    {types: ['geocode']});

	console.log(autocomplete);

	autocomplete.addListener('place_changed', fillInAddress);

	return autocomplete;
}

// Google Maps Places API
// executes upon page load
// requests location from user's browser
function geolocate() {
	console.log("geolocate");

	if (navigator.geolocation) {

		var lat, lng;

		navigator.geolocation.getCurrentPosition(function(position) {

			var geolocation = {
			  lat: position.coords.latitude,
			  lng: position.coords.longitude
			};

			//put into search function

			var circle = new google.maps.Circle({
			  center: geolocation,
			  radius: position.coords.accuracy
			});

			lat = geolocation.lat;
			lng = geolocation.lng;

			autocomplete.setBounds(circle.getBounds());
		});
  }
}

// Google Maps Places API
// executes upon start of input entry
// autocompletes search input
function fillInAddress() {

	var place = autocomplete.getPlace();

	for (var component in componentForm) {

	  document.getElementById(component).value = '';
	  document.getElementById(component).disabled = true;
	}

	for (var i = 0; i < place.address_components.length; i++) {
	  var addressType = place.address_components[i].types[0];
	  if (componentForm[addressType]) {
	    var val = place.address_components[i][componentForm[addressType]];
	    document.getElementById(addressType).value = val;
	  }
	}
}

// custom functions for get and set
// can be used more easily than built-in
// because they allow object or string values
function setLocalStorage(key, value) {

	localStorage.setItem(key, JSON.stringify(value));
}

function getLocalStorage(key) {

	var result = JSON.parse(localStorage.getItem(key));
	return result;
}


