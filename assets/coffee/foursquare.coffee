class Foursquare
	category: '4bf58dd8d48988d116941735'
	url: 'https://api.foursquare.com/v2/venues'
	oauth: 'ZN1EU0HVWFSKKSEAOYI4OZ3VWKZISEOA5U2TLBAIGJYIXLLB'
	id: 'JT0GWZDB0MJPLMCYXVGGPSO5PKVWHU1KP5CJBWYTHOTNKRFM'
	secret: 'VIHV5SJV0GEQENADWSLWDS3O2ET2GMCUCLHELFHYKUV0G2SY'
	# id: 'LHTVMBRCPPSHVARXE1BZ5L1QH23TJAJFTUG2S3HDMC04Y5ZY'
	# secret: 'DWEWRSKTGITH2LNFG4DEWZZ0MJDNMGKVIROALDMTWR22S4ZO'

	build: ->
		"client_id=#{@id}&client_secret=#{@secret}&v=20130407"
		# "oauth_token=#{@oauth}&v=20130407"

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
						if ratio > 0.40
							return true
						return false

				bar = bars[_.random(0, bars.length-1)]
				@follow(bar.venue, postFollow)

		$.ajax "#{@url}/search?ll=#{lat},#{lng}&categoryId=#{@category}&#{@build()}",
			type: "GET"
			dataType: "json"
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
			success: (d) ->
				d = d.response.venue
				venue.rating = d.rating

				if d.hours?
					venue.open = d.hours.isOpen
					venue.openUntil = _.find d.hours.timeframes, 
						(t) ->
							if t.includesToday?
								return true
							return false
					# console.log(venue.openUntil)
					venue.openUntil = venue.openUntil.open[0].renderedTime.split("–")
					venue.openUntil = venue.openUntil[1]

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
			success: (d) ->
				photos = d.response.photos.items

				url = "#{photos[0].prefix}300x300#{photos[0].suffix}"
				venue.photo = url

				process photos

		$.ajax "#{@url}/#{venue.id}/tips?sort=popular&limit=500&#{@build()}",
			type: "GET"
			dataType: "json"
			success: (d) ->
				tips = d.response.tips.items
				process tips

	follow: (venue, handler) ->
		$.ajax "#{@url}/#{venue.id}/nextvenues?#{@build()}",
			type: "GET"
			dataType: "json"
			success: (d) ->
				next = d.response.nextVenues.items
				next = _.filter next,
					(p) ->
						for id, category of p.categories
							if category.name.toLowerCase().indexOf("bar") != -1
								return true
						return false
				handler next

