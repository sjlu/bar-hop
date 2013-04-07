class Foursquare
	category: '4bf58dd8d48988d116941735'
	url: 'https://api.foursquare.com/v2/venues'
	oauth: 'ZN1EU0HVWFSKKSEAOYI4OZ3VWKZISEOA5U2TLBAIGJYIXLLB'
	tokens: [
		{
			id: 'JT0GWZDB0MJPLMCYXVGGPSO5PKVWHU1KP5CJBWYTHOTNKRFM'
			secret: 'VIHV5SJV0GEQENADWSLWDS3O2ET2GMCUCLHELFHYKUV0G2SY'
		},
		{
			id: '0GN4ZBT1UKVRMJEUDRKALEX1K1SKE5B0YCGOK1ASX50Z0N4D'
			secret: 'LAUGEKOXA5EF0BAEF5EEWECJ5QIT4TWHGUX5TWPRYGFTNAK5'
		},
		{
			id: 'LHTVMBRCPPSHVARXE1BZ5L1QH23TJAJFTUG2S3HDMC04Y5ZY'
			secret: 'DWEWRSKTGITH2LNFG4DEWZZ0MJDNMGKVIROALDMTWR22S4ZO'
		},
		{
			id: 'B1TY4U1YQJK0GPOE5UYVHWOKG02HKIMJVVQHVMUHITHWQFAU'
			secret: '040KWJXO1UYPLTCDQ2J14TEAM2KY0V5KS32WYIIGDLKXVIFQ'
		},
		{
			id: '1CPR5PG1YRWPJRR0ZDCNCSOCK4ELVJHAPRQHHEYB15YYDR5H'
			secret: 'AIHBIUJIEGCL55WKPLCNAZDHJQ0TSVFOUFUF4OHAY5FXVD04'
		}
	]
	key: ""

	constructor: ->
		token = @tokens[_.random(0, @tokens.length-1)]
		@key = "client_id=#{token.id}&client_secret=#{token.secret}&v=20130407"

	build: ->
		@key

	fail: ->
		$('#error').show()

	byLocation: (lat, lng, handler) ->
		count = 0
		bars = []
		bar = {}

		postFollow = (d) =>
			next = []
			postFollowAnalyze = (p) ->
				next.push(p)
				if next.length >= d.length
					handler
						first: bar
						next: next

			for id, place of d
				@analyze(place, postFollowAnalyze)

		postAnalyze = (d) =>
			bars.push d
			if bars.length >= count
				bars = _.filter bars,
					(b) ->
						ratio = b.female / (b.female + b.male)
						if ratio > 0.35
							return true
						return false

				bar = bars[_.random(0, bars.length-1)]
				@follow(bar.venue, postFollow)

		$.ajax "#{@url}/search?ll=#{lat},#{lng}&categoryId=#{@category}&#{@build()}",
			type: "GET"
			dataType: "json"
			error: @fail
			success: (d) =>
				count = d.response.venues.length
				places = d.response.venues
				for id, place of places
					@analyze(place, postAnalyze)

	byVenue: (venue, handler) ->
		postFollow = (d) =>
			next = []
			postFollowAnalyze = (p) ->
				next.push(p)
				if next.length >= d.length
					handler
						next: next

			for id, place of d
				@analyze(place, postFollowAnalyze)

		@follow(venue, postFollow)

	analyze: (venue, handler) ->
		processed = 0
		users = []

		process = (items) ->
			if items?
				for id, item of items
					users.push
						id: item.user.id
						gender: item.user.gender

			processed++

			if processed == 3
				users = _.unique users, 
					(u) -> 
						u.id

				male = 0
				female = 0

				for id, user of users
					switch user.gender
						when "male" then male++
						when "female" then female++

				handler
					venue: venue
					male: male
					female: female

		$.ajax "#{@url}/#{venue.id}?#{@build()}",
			type: "GET"
			dataType: "json"
			error: @fail
			success: (d) ->
				d = d.response.venue
				venue.rating = d.rating

				if d.hours?
					venue.open = d.hours.isOpen
					openUntil = _.find d.hours.timeframes, 
						(t) ->
							if t.includesToday?
								return true
							return false
					# console.log(venue.openUntil)
					if openUntil? and openUntil.open?
						openUntil = openUntil.open[0].renderedTime.split("–")
						openUntil = openUntil[1]
						venue.openUntil = openUntil

				if d.popular?
					if not venue.open?
						venue.open = d.popular.isOpen
					venue.popularHours = _.find d.popular.timeframes,
						(t) ->
							if t.includesToday?
								return true
							return false

					venue.popularHours = venue.popularHours.open[0].renderedTime

				if d.price?
					venue.price = d.price.tier

				process()

		$.ajax "#{@url}/#{venue.id}/photos?sort=popular&limit=500&#{@build()}",
			type: "GET"
			dataType: "json"
			error: @fail
			success: (d) ->
				photos = d.response.photos.items

				url = "#{photos[0].prefix}300x300#{photos[0].suffix}"
				venue.photo = url

				process photos

		$.ajax "#{@url}/#{venue.id}/tips?sort=popular&limit=500&#{@build()}",
			type: "GET"
			dataType: "json"
			error: @fail
			success: (d) ->
				tips = d.response.tips.items
				process tips

	follow: (venue, handler) ->
		$.ajax "#{@url}/#{venue.id}/nextvenues?#{@build()}",
			type: "GET"
			dataType: "json"
			error: @fail
			success: (d) ->
				next = d.response.nextVenues.items
				next = _.filter next,
					(p) ->
						for id, category of p.categories
							if category.name.toLowerCase().indexOf("bar") != -1
								return true
						return false
				handler next

