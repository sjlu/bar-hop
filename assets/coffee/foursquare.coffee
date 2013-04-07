class Foursquare
	category: '4bf58dd8d48988d116941735'
	url: 'https://api.foursquare.com/v2/venues'
	oauth: 'ZN1EU0HVWFSKKSEAOYI4OZ3VWKZISEOA5U2TLBAIGJYIXLLB'
	id: 'JT0GWZDB0MJPLMCYXVGGPSO5PKVWHU1KP5CJBWYTHOTNKRFM'
	secret: 'VIHV5SJV0GEQENADWSLWDS3O2ET2GMCUCLHELFHYKUV0G2SY'

	build: ->
		"client_id=#{@id}&client_secret=#{@secret}"

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
						if ratio > 0.45
							return true
						return false

				bar = bars[_.random(0, bars.length-1)]
				@follow(bar.venue, postFollow)

		$.ajax "#{@url}/search?ll=#{lat},#{lng}&categoryId=#{@category}&#{@build()}",
			type: "GET"
			dataType: "json"
			success: (d) =>
				count = d.response.groups[0].items.length
				places = d.response.groups[0].items
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
			for id, item of items
				users.push
					id: item.user.id
					gender: item.user.gender

			processed++

			if processed == 2
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

		$.ajax "#{@url}/#{venue.id}/photos?sort=popular&limit=500&#{@build()}",
			type: "GET"
			dataType: "json"
			success: (d) ->
				photos = d.response.photos.groups[1].items
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

