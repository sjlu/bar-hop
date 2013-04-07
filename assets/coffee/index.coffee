$(document).ready ->
	recurse = 0;
	places = []

	foursquare = new Foursquare()

	postLookup = ->
		console.log places

	postFoursquare = (d) ->
		d.next = _.sortBy d.next,
			(b) ->
				return -(b.female / (b.female + b.male));

		best = d.next[0]
		for id, place of d.next
			if not _.contains(places, d.next)
				best = place

		if recurse < 1
			places.push d.first;

		places.push best;

		recurse++;
		if recurse < 3
			foursquare.byVenue(best.venue, postFoursquare)
		else
			postLookup()

	postLocation = (d) ->
		console.log d
		foursquare.byLocation(d.lat, d.lng, postFoursquare)

	location = new Location(postLocation)

	window.mySwipe = new Swipe document.getElementById('slider'),
		startSlide: 0
		speed: 300
		auto: 3000
		continuous: true
		disableScroll: false
		stopPropagation: false
		callback: (index, elem) ->
		transitionEnd: (index, elem) ->