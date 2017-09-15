// Initial Variable
var initialLocations = [
  {title: "SightGlass Coffee", location: {lat: 37.776981, lng: -122.408586}},
  {title: "Blue Bottle Coffee", location: {lat: 37.776392, lng: -122.423337}},
  {title: "Ritual Coffee", location: {lat: 37.776384, lng: -122.424173}},
  {title: "Four Barrel Coffee", location: {lat: 37.767010, lng: -122.421973}},
  {title: "Réveille Coffee Co.", location: {lat: 37.761032, lng: -122.434438}}
];

// CoffeeShop Object
var coffeeShop(data){
  this.title = data.title;
  this.location = data.location;
}


// Basic ViewModel
var ViewModel = function(){
  var self = this;

  // list of coffee shop objects
  this.coffeeShopList = ko.observable([]);

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
