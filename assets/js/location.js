var Location;

Location = (function() {

  Location.prototype.url = 'http://sjlu.cities.jit.su';

  function Location(handler) {
    var errorHandler, successHandler,
      _this = this;
    successHandler = function(position) {
      return handler({
        lat: position.coords.latitude,
        lng: position.coords.longitude
      });
    };
    errorHandler = function() {
      return handler({
        lat: "40.739022",
        lng: "-73.98205"
      });
    };
    navigator.geolocation.getCurrentPosition(successHandler, errorHandler);
  }

  return Location;

})();
