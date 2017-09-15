// Initial Variable
var initialLocations = [
  {title: "SightGlass Coffee", location: {lat: 37.776981, lng: -122.408586}},
  {title: "Blue Bottle Coffee", location: {lat: 37.776392, lng: -122.423337}},
  {title: "Ritual Coffee Roasters", location: {lat: 37.776384, lng: -122.424173}},
  {title: "Four Barrel Coffee", location: {lat: 37.767010, lng: -122.421973}},
  {title: "Philz Coffee", location: {lat: 37.782412, lng:-122.420539}}
];

// Render Google Maps API.
var map;
var markers = [];
var myInfoWindow;

function initMap() {
  // my neighborhood of choice: San Francisco
  // Modified version of work used in class
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 37.778673, lng:-122.406446},
    zoom: 13
  });

  var largeInfoWindow = new google.maps.InfoWindow();
  myInfoWindow = largeInfoWindow;

  var bounds = new google.maps.LatLngBounds();

  for (var i = 0; i < initialLocations.length; i++){

      var position = initialLocations[i].location;
      var title = initialLocations[i].title;

      var marker = new google.maps.Marker({
        id: i,
        position: position,
        map: map,
        title: title,
        animation: google.maps.Animation.DROP
      });

      markers.push(marker);

      bounds.extend(marker.position);

      marker.addListener('click', function(){
        populateInfoWindow(this, largeInfoWindow);
      });

      marker.addListener('click', toggleBounce);
      map.addListener('click', function(){
        for (var i = 0; i < markers.length; i++){
          var cur = markers[i];
          if (cur.getAnimation() !== null){
            cur.setAnimation(null);
          }
        }
      });
  }

  function populateInfoWindow(marker, infowindow){
    if (infowindow.marker != marker) {
      infowindow.marker = marker;
      infowindow.setContent(
        '<h1 class="marker-title">' + marker.title + '</h1>' +
        '<p>' + 'Wikipedia Articles to Consider:' + '</p>' +
        '<ul id="wiki-articles"></ul>' +
        '<p>' + 'NYT Articles to Consider:' + '</p>' +
        '<ul id="nyt-articles"></ul>'
    );

    // NYT API
    var nytimesUrl = 'http://api.nytimes.com/svc/search/v2/articlesearch.json?q=' + marker.title + '&sort=newest&api-key=f012d63c93334b108dfdfab661e2faed';
    $.getJSON(nytimesUrl, function(data){
      articles = data.response.docs;
      if (!articles.length){
        $('#wiki-articles').append("No NYT articles to show...");
        return false;
      }
      for(var i = 0; i < articles.length; i++){ // for each article add a link to the infowindow
        var article = articles[i];
        $('#nyt-articles').append('<li><a href="'+ article.web_url +'">' + article.headline.main + '</a></li>');
      }
    });

    // Wikipedia API
    var wikiUrl = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' + marker.title + '&format=json&callback=wikiCallback';
    $.ajax({
      url: wikiUrl,
      dataType: "jsonp",
      success: function(response){
        var articleList = response[1];
        if (!articleList.length) {
          $('#wiki-articles').append("No Wikipedia articles to show...")
        }
        for (var i = 0; i < articleList.length; i++){
          articleStr = articleList[i];
          var url = "http://en.wikipedia.org/wiki/" + articleStr;
          $('#wiki-articles').append('<li><a href="'+ url +'">' + articleStr + '</a></li>');
        }
      }
    });

      infowindow.open(map, marker);
      infowindow.addListener('closeclick', function(){
        //infowindow.setMarker(null); I Am getting an error here?
        if (marker.getAnimation() !== null){
          marker.setAnimation(null);
        }
      });
    }
  }

  function toggleBounce(){
    // Got help from https://developers.google.com/maps/documentation/javascript/examples/marker-animations
    if (this.getAnimation() !== null){
      this.setAnimation(null);
    } else {
      this.setAnimation(google.maps.Animation.BOUNCE);
    }
  }
}

// CoffeeShop Object
var coffeeShop = function(data){
  this.title = ko.observable(data.title);
  this.location = ko.observable(data.location);
};


// Basic ViewModel
var ViewModel = function(){
  var self = this;

  // list of coffee shop objects
  this.coffeeShopList = ko.observableArray([]);

  // for each datum in initialLocations feed that data into the coffeeShop
  // constructor and push into a list.
  initialLocations.forEach(function(shopData){
    self.coffeeShopList.push(new coffeeShop(shopData));
  });

  this.currentCoffeeShop = ko.observable(this.coffeeShopList()[0]);

  // Function to set and highlight coffee shop of choice.
  this.setCoffeeShop = function(clickedCoffeeShop){
      self.currentCoffeeShop(clickedCoffeeShop);

      // TODO: Get Marker for Coffee Shop
      var location = clickedCoffeeShop.location;
      for (var i = 0; i < markers.length; i++) {
        var marker = markers[i];
        if (JSON.stringify(location) == JSON.stringify(marker.location)){
          console.log(marker);
          break;
        }
      }
      // TODO: Open InfoWindow for that Coffee Shop
      myInfoWindow.open(map, marker);
  };

  // function to open left pane on click of hamburger icon
  this.openLeftPane = function(){

    $(document).ready(function(){
      function a(){
        var self = this;
        $('#map').animate({width: "70%"});
        window.setTimeout(function(){
          $('.left-sidebar').animate({width: "30%"});
        }, 1);

        window.setTimeout(function(){
          $(self).one('click', b);
        }, 1000);
      };

      function b(){
        var self = this;
        $('.left-sidebar').animate({width: "0%"});
        window.setTimeout(function(){
          $('#map').animate({width: "100%"});
        }, 1);

        window.setTimeout(function(){
          $(self).one('click', a);
        }, 1000);
      };

      $('.fa-bars').unbind().one('click', a);

    });

  };



};

// Apply Bindings
ko.applyBindings(new ViewModel());
