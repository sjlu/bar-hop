$(document).ready ->
	recurse = 0;
	places = []

	foursquare = new Foursquare()

	render = ->
		console.log places
		source = $("#place").html();
		template = Handlebars.compile(source);
		$('#loading').hide()	
		for id, place of places
			open = null
			if place.venue.open
				open = "Open"
				if place.venue.openUntil
					open += " until #{place.venue.openUntil}"
			else
				open = "Closed"

			count = 0
			price = ""
			while count < place.venue.price
				price += "$"
				count++

			popular = ""
			if place.venue.popularHours?
				popular = place.venue.popularHours.replace("-", " to ")

			context = 
				image: place.venue.photo
				name: place.venue.name
				location: "#{place.venue.location.address}, #{place.venue.location.city}, #{place.venue.location.state}"
				lat: place.venue.location.lat
				lng: place.venue.location.lng
				ratio: Math.round((place.female / (place.female + place.male)) * 100)
				rating: place.venue.rating
				open: open
				price: price
				popular: popular

			# console.log context
			$('.swipe-wrap').append(template(context))

		bullets = $('#nav li');
		window.mySwipe = new Swipe document.getElementById('slider'),
			startSlide: 0
			speed: 300
			auto: 0
			continuous: true
			disableScroll: true
			stopPropagation: false
			callback: (index) ->
				i = bullets.length
				while i--
			        bullets[i].className = ' ';

				bullets[index].className = 'on';

			transitionEnd: (index, elem) ->

		$('#nav').show()
		bullets.click ->
			window.mySwipe.slide($(@).attr('data-num'), 1000)

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
		if recurse < 2
			foursquare.byVenue(best.venue, postFoursquare)
		else
			render()

	postLocation = (d) ->
		console.log d
		foursquare.byLocation(d.lat, d.lng, postFoursquare)

	location = new Location(postLocation)