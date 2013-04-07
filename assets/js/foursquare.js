var Foursquare;

Foursquare = (function() {

  Foursquare.prototype.category = '4bf58dd8d48988d116941735';

  Foursquare.prototype.url = 'https://api.foursquare.com/v2/venues';

  Foursquare.prototype.oauth = 'ZN1EU0HVWFSKKSEAOYI4OZ3VWKZISEOA5U2TLBAIGJYIXLLB';

  Foursquare.prototype.tokens = [
    {
      id: 'JT0GWZDB0MJPLMCYXVGGPSO5PKVWHU1KP5CJBWYTHOTNKRFM',
      secret: 'VIHV5SJV0GEQENADWSLWDS3O2ET2GMCUCLHELFHYKUV0G2SY'
    }, {
      id: '0GN4ZBT1UKVRMJEUDRKALEX1K1SKE5B0YCGOK1ASX50Z0N4D',
      secret: 'LAUGEKOXA5EF0BAEF5EEWECJ5QIT4TWHGUX5TWPRYGFTNAK5'
    }, {
      id: 'LHTVMBRCPPSHVARXE1BZ5L1QH23TJAJFTUG2S3HDMC04Y5ZY',
      secret: 'DWEWRSKTGITH2LNFG4DEWZZ0MJDNMGKVIROALDMTWR22S4ZO'
    }, {
      id: 'B1TY4U1YQJK0GPOE5UYVHWOKG02HKIMJVVQHVMUHITHWQFAU',
      secret: '040KWJXO1UYPLTCDQ2J14TEAM2KY0V5KS32WYIIGDLKXVIFQ'
    }, {
      id: '1CPR5PG1YRWPJRR0ZDCNCSOCK4ELVJHAPRQHHEYB15YYDR5H',
      secret: 'AIHBIUJIEGCL55WKPLCNAZDHJQ0TSVFOUFUF4OHAY5FXVD04'
    }
  ];

  Foursquare.prototype.key = "";

  function Foursquare() {
    var token;
    token = this.tokens[_.random(0, this.tokens.length - 1)];
    this.key = "client_id=" + token.id + "&client_secret=" + token.secret + "&v=20130407";
  }

  Foursquare.prototype.build = function() {
    return this.key;
  };

  Foursquare.prototype.fail = function() {
    return $('#error').show();
  };

  Foursquare.prototype.byLocation = function(lat, lng, handler) {
    var bar, bars, count, postAnalyze, postFollow,
      _this = this;
    count = 0;
    bars = [];
    bar = {};
    postFollow = function(d) {
      var id, next, place, postFollowAnalyze, _results;
      next = [];
      postFollowAnalyze = function(p) {
        next.push(p);
        if (next.length >= d.length) {
          return handler({
            first: bar,
            next: next
          });
        }
      };
      _results = [];
      for (id in d) {
        place = d[id];
        _results.push(_this.analyze(place, postFollowAnalyze));
      }
      return _results;
    };
    postAnalyze = function(d) {
      bars.push(d);
      if (bars.length >= count) {
        bars = _.filter(bars, function(b) {
          var ratio;
          ratio = b.female / (b.female + b.male);
          if (ratio > 0.35) {
            return true;
          }
          return false;
        });
        bar = bars[_.random(0, bars.length - 1)];
        return _this.follow(bar.venue, postFollow);
      }
    };
    return $.ajax("" + this.url + "/search?ll=" + lat + "," + lng + "&categoryId=" + this.category + "&" + (this.build()), {
      type: "GET",
      dataType: "json",
      error: this.fail,
      success: function(d) {
        var id, place, places, _results;
        count = d.response.venues.length;
        places = d.response.venues;
        _results = [];
        for (id in places) {
          place = places[id];
          _results.push(_this.analyze(place, postAnalyze));
        }
        return _results;
      }
    });
  };

  Foursquare.prototype.byVenue = function(venue, handler) {
    var postFollow,
      _this = this;
    postFollow = function(d) {
      var id, next, place, postFollowAnalyze, _results;
      next = [];
      postFollowAnalyze = function(p) {
        next.push(p);
        if (next.length >= d.length) {
          return handler({
            next: next
          });
        }
      };
      _results = [];
      for (id in d) {
        place = d[id];
        _results.push(_this.analyze(place, postFollowAnalyze));
      }
      return _results;
    };
    return this.follow(venue, postFollow);
  };

  Foursquare.prototype.analyze = function(venue, handler) {
    var process, processed, users;
    processed = 0;
    users = [];
    process = function(items) {
      var female, id, item, male, user;
      if (items != null) {
        for (id in items) {
          item = items[id];
          users.push({
            id: item.user.id,
            gender: item.user.gender
          });
        }
      }
      processed++;
      if (processed === 3) {
        users = _.unique(users, function(u) {
          return u.id;
        });
        male = 0;
        female = 0;
        for (id in users) {
          user = users[id];
          switch (user.gender) {
            case "male":
              male++;
              break;
            case "female":
              female++;
          }
        }
        return handler({
          venue: venue,
          male: male,
          female: female
        });
      }
    };
    $.ajax("" + this.url + "/" + venue.id + "?" + (this.build()), {
      type: "GET",
      dataType: "json",
      error: this.fail,
      success: function(d) {
        var openUntil;
        d = d.response.venue;
        venue.rating = d.rating;
        if (d.hours != null) {
          venue.open = d.hours.isOpen;
          openUntil = _.find(d.hours.timeframes, function(t) {
            if (t.includesToday != null) {
              return true;
            }
            return false;
          });
          if ((openUntil != null) && (openUntil.open != null)) {
            openUntil = openUntil.open[0].renderedTime.split("–");
            openUntil = openUntil[1];
            venue.openUntil = openUntil;
          }
        }
        if (d.popular != null) {
          if (!(venue.open != null)) {
            venue.open = d.popular.isOpen;
          }
          venue.popularHours = _.find(d.popular.timeframes, function(t) {
            if (t.includesToday != null) {
              return true;
            }
            return false;
          });
          venue.popularHours = venue.popularHours.open[0].renderedTime;
        }
        if (d.price != null) {
          venue.price = d.price.tier;
        }
        return process();
      }
    });
    $.ajax("" + this.url + "/" + venue.id + "/photos?sort=popular&limit=500&" + (this.build()), {
      type: "GET",
      dataType: "json",
      error: this.fail,
      success: function(d) {
        var photos, url;
        photos = d.response.photos.items;
        url = "" + photos[0].prefix + "300x300" + photos[0].suffix;
        venue.photo = url;
        return process(photos);
      }
    });
    return $.ajax("" + this.url + "/" + venue.id + "/tips?sort=popular&limit=500&" + (this.build()), {
      type: "GET",
      dataType: "json",
      error: this.fail,
      success: function(d) {
        var tips;
        tips = d.response.tips.items;
        return process(tips);
      }
    });
  };

  Foursquare.prototype.follow = function(venue, handler) {
    return $.ajax("" + this.url + "/" + venue.id + "/nextvenues?" + (this.build()), {
      type: "GET",
      dataType: "json",
      error: this.fail,
      success: function(d) {
        var next;
        next = d.response.nextVenues.items;
        next = _.filter(next, function(p) {
          var category, id, _ref;
          _ref = p.categories;
          for (id in _ref) {
            category = _ref[id];
            if (category.name.toLowerCase().indexOf("bar") !== -1) {
              return true;
            }
          }
          return false;
        });
        return handler(next);
      }
    });
  };

  return Foursquare;

})();
