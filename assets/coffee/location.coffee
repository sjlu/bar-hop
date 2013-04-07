class Location
	url: 'http://sjlu.cities.jit.su'

	constructor: (handler) ->
		successHandler = (position) => 
			handler
				lat: position.coords.latitude
				lng: position.coords.longitude

		errorHandler = =>			
			# default is NYC 10010
			handler 
				lat: "40.739022"
				lng: "-73.98205"

		return handler 
			lat: "40.739022"
			lng: "-73.98205"

		navigator.geolocation.getCurrentPosition(successHandler, errorHandler)