var currentPosition;
var temp = {};
var wind = {};
var tid = undefined;
var refreshInterval = 600000;

$(window).resize(onResize);

function onResize() {
  adjustFont("#locale");
  reset("#conditionLabel");
  adjustFont("#conditionLabel")
}

function reset(selector) {
  $(selector).removeAttr('style');
}

$(document).ready(function() {
  if (!redirectHttps()) {
    setListeners();
    getLocation();
  }
});

/*returns true if redirecting to https */
function redirectHttps() {
  if (location.protocol === 'http:') {
    var hrefOld = location.href;
    location.replace(location.href.replace(/http:\/\//i, "https://"));
    console.log("Redirecting from: " + hrefOld);
    return true;
  } else {
    console.log("Not http: " + location.href)
    return false;
  }
}

function setListeners() {
  $("#actualUnits").on("click", changeUnits);
  $("#alertButton").on("click", function() {
      $("#alert").animate({opacity: 0}, 300, function() {
        $("#alert").css("display", "none");
        getLocation();
      });    
    });
}

function getLocation() {
  var geo_options = {
    timeout: 15000
  };
  
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition, showError);
  } else {
    showAlert("Geolocation is not supported by this browser.");
  }
}

function showPosition(pos) {
  currentPosition = {
    latitude: pos.coords.latitude,
    longitude: pos.coords.longitude
  };
  //console.log("showPosition: " + currentPosition.latitude + ", " + currentPosition.longitude);
  myMap();
  getWeather(); 
}

function showError(error) {
  //console.log("showError: code: " + error.code + " msg: " + error.message);
  //console.log("PERMISSION_DENIED: " + error.PERMISSION_DENIED + " POSITION_UNAVAILABLE: " + error.POSITION_UNAVAILABLE + " TIMEOUT: " + error.TIMEOUT + " UNKNOWN_ERROR: " + error.UNKNOWN_ERROR)
  switch (error.code) {
    case error.PERMISSION_DENIED:
      showAlert("User denied the request for Geolocation.");
      break;
    case error.POSITION_UNAVAILABLE:
      showAlert("Location information is unavailable.");
      break;
    case error.TIMEOUT:
      showAlert("The request to get user location timed out.");
      break;
    case error.UNKNOWN_ERROR:
      showAlert("An unknown error occurred.");
      break;
  }
}

function myMap() {
  console.log("myMap: " + currentPosition.latitude + ", " + currentPosition.longitude);
  var mapProp = {
    center: {
      lat: currentPosition.latitude,
      lng: currentPosition.longitude
    },
    zoom: 13,
    mapTypeId: google.maps.MapTypeId.SATELLITE,
    disableDefaultUI: true,
    draggable: false,
    keyboardShortcuts: false,
    backgroundColor: "black"
  };
  var map = new google.maps.Map(document.getElementById("googleMap"), mapProp);
}

/*
function getStaticMap() {
  console.log("myMap: " + currentPosition.latitude + ", " + currentPosition.longitude);
  var GStaticKey = "AIzaSyBSDZ7V8rjAXpfTwKtWLavFDFKJhKWlLio";
  var center = currentPosition.latitude + "," + currentPosition.longitude;
  var zoom = "13";
  var mapType = "satellite";
  var size = "1000x1000";
  var mapUrl = "https://maps.googleapis.com/maps/api/staticmap?center=" + center + "&zoom=" + zoom + "&size=" + size + "&maptype=" + mapType + "&key=" + GStaticKey;
  console.log("mapUrl: " + mapUrl);
  $("#googleMap").attr("src", mapUrl);
}
*/

function getWeather() {
  WUKey = "213aae405504fe4c";
  var features = "conditions";
  var weatherUrl = "https://api.wunderground.com/api/" + WUKey + "/" + features + "/q/" + currentPosition.latitude + "," + currentPosition.longitude + ".json";
  weatherUrl = encodeURI(weatherUrl);
  console.log("Weather URL: " + weatherUrl);
  $.getJSON(weatherUrl, showWeather);
}

function showWeather(response) {
  console.log("showWeather");
  console.log(response);
  if (response.response.error) {
    showAlert("No weather data available for your location.");
  } else {
    var tid = setTimeout(getWeather, refreshInterval);
    var current = response.current_observation;
    $("#locale").html(current.display_location.full);
    adjustFont("#locale");
    temp = {
      actual: {
        f: current.temp_f,
        c: current.temp_c
      },
      feel: {
        f: current.feelslike_f,
        c: current.feelslike_c
      }
    };
    setF();
    wind = {
      mph: current.wind_mph,
      kph: current.wind_kph
    };
    setMph();
    $("#conditionLabel").html(current.weather);
    var iconUrl = current.icon_url.replace(/http:\/\//i, "https://");
    $("#conditionIcon").attr("src", iconUrl);
    adjustFont("#conditionLabel");
    $("#weather").css("visibility", "visible");
    $("#weather").animate({ opacity: 1 }, 2250, "linear");
  }
}

function stopRefresh() {
  clearTimeout(tid);
}

function setF() {
  $("#actualDegrees").html(temp.actual.f);
  $("#feelDegrees").html(temp.feel.f);
  $(".tempUnits").html("F");
  temp.current = "F";
}

function setC() {
  $("#actualDegrees").html(temp.actual.c);
  $("#feelDegrees").html(temp.feel.c);
  $(".tempUnits").html("C");
  temp.current = "C";
}

function setMph() {
  $("#windValue").html(wind.mph);
  $("#windUnits").html("mph");
  wind.current = "mph";
}

function setKph() {
  $("#windValue").html(wind.kph);
  $("#windUnits").html("kph");
  wind.current = "kph";
}

function changeUnits() {
  /*alert("Width: " + window.innerWidth + " Height: " + window.innerHeight);*/
  if (temp.current === "F") {
    setC();
    setKph();
  } else {
    setF();
    setMph();
  }
}

function showAlert(info) {
  $("#alertInfo").html(info);
  $("#alert").css("display", "block");
  $("#alert").animate({opacity: 1}, 500);
}

function adjustFont(selector) {
  var element = $(selector);
  var parent = element.parent();
    //$('#fitin div').css('font-size', '1em');
    //console.log("function: " + element[0].scrollWidth + ", " + parent.width());
    //while( $('#locale')[0].scrollWidth > $('#locality').width() ) {
    while( element[0].scrollWidth > Math.ceil(parent.width()) ) {
      //console.log("adjust: " + $('#locale').css("font-size"));
        element.css('font-size', (parseInt(element.css('font-size')) - 1) + "px" );
      //console.log("adjust2: " + $('#locale').css("font-size"));
      //console.log("function2: " + element[0].scrollWidth + ", " + parent.width());
    }
}