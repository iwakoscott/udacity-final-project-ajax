// Initial Variable
var initialLocations = [
  {title: "SightGlass Coffee", location: {lat: 37.776981, lng: -122.408586}},
  {title: "Blue Bottle Coffee", location: {lat: 37.776392, lng: -122.423337}},
  {title: "Ritual Coffee", location: {lat: 37.776384, lng: -122.424173}},
  {title: "Four Barrel Coffee", location: {lat: 37.767010, lng: -122.421973}},
  {title: "Réveille Coffee Co.", location: {lat: 37.761032, lng: -122.434438}}
];

// Render Google Maps API.
var map;
var markers = [];

function initMap() {
  // my neighborhood of choice: San Francisco
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 37.778673, lng:-122.406446},
    zoom: 14
  });

  var largeInfoWindow = new google.maps.InfoWindow();
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
      for(var i = 0; i < articles.length; i++){
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
        if (articleList.length === 0) {
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
  this.title = data.title;
  this.location = data.location;
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

  this.currentCoffeeShop = this.coffeeShopList()[0];

  // Function to set and highlight coffee shop of choice.
  this.setCoffeeShop = function(clickedCoffeeShop){
      self.currentCoffeeShop(clickedCoffeeShop);
  };

};

// Apply Bindings
ko.applyBindings(new ViewModel());
