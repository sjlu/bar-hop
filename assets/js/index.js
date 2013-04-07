
$(document).ready(function() {
  var foursquare, location, places, postFoursquare, postLocation, recurse, render;
  recurse = 0;
  places = [];
  foursquare = new Foursquare();
  render = function() {
    var bullets, context, count, id, open, place, popular, price, source, template;
    console.log(places);
    source = $("#place").html();
    template = Handlebars.compile(source);
    $('#loading').hide();
    for (id in places) {
      place = places[id];
      open = null;
      if (place.venue.open) {
        open = "Open";
        if (place.venue.openUntil) {
          open += " until " + place.venue.openUntil;
        }
      } else {
        open = "Closed";
      }
      count = 0;
      price = "";
      while (count < place.venue.price) {
        price += "$";
        count++;
      }
      popular = "";
      if (place.venue.popularHours != null) {
        popular = place.venue.popularHours.replace("-", " to ");
      }
      context = {
        image: place.venue.photo,
        name: place.venue.name,
        location: "" + place.venue.location.address + ", " + place.venue.location.city + ", " + place.venue.location.state,
        lat: place.venue.location.lat,
        lng: place.venue.location.lng,
        ratio: Math.round((place.female / (place.female + place.male)) * 100),
        rating: place.venue.rating,
        open: open,
        price: price,
        popular: popular
      };
      $('.swipe-wrap').append(template(context));
    }
    bullets = $('#nav li');
    window.mySwipe = new Swipe(document.getElementById('slider'), {
      startSlide: 0,
      speed: 300,
      auto: 0,
      continuous: true,
      disableScroll: true,
      stopPropagation: false,
      callback: function(index) {
        var i;
        i = bullets.length;
        while (i--) {
          bullets[i].className = ' ';
        }
        return bullets[index].className = 'on';
      },
      transitionEnd: function(index, elem) {}
    });
    $('#nav').show();
    return bullets.click(function() {
      return window.mySwipe.slide($(this).attr('data-num'), 1000);
    });
  };
  postFoursquare = function(d) {
    var best, id, place, _ref;
    d.next = _.sortBy(d.next, function(b) {
      return -(b.female / (b.female + b.male));
    });
    best = d.next[0];
    _ref = d.next;
    for (id in _ref) {
      place = _ref[id];
      if (!_.contains(places, d.next)) {
        best = place;
      }
    }
    if (recurse < 1) {
      places.push(d.first);
    }
    places.push(best);
    recurse++;
    if (recurse < 2) {
      return foursquare.byVenue(best.venue, postFoursquare);
    } else {
      return render();
    }
  };
  postLocation = function(d) {
    console.log(d);
    return foursquare.byLocation(d.lat, d.lng, postFoursquare);
  };
  return location = new Location(postLocation);
});
