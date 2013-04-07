# Bar Hop

We get a list of bars for you to hop to. This is a HackNY Spring 2013 project by [Steven Lu](https://github.com/sjlu) and [Jason Caetano](https://github.com/jcaetano). Look at [Sunrise](https://github.com/sjlu/sunrise.git) for more information on how to compile this project.

## How It Works

### Steps

* We take a look at your location, if it's not possible we default to NYC.
* We then look at popular bars around the area from Foursquare and rank order them by male to female ratio.
* We then filter the ratio and select a bar at random.
* We take a look at the bars information and look at where people go to afterwards using Foursquare.
* From that result set, we lookup, rate and choose the best ratio.
* We repeat this process about 3 more times to get your a list of bars to hop around that's popular amongst the locals.

### APIs

We use one and only one API, the [Foursquare](https://developer.foursquare.com/) API. And we hit it about 100 times per request so you may wanna spin up your own instance with your own keys.

### Technologies

* [jQuery](http://jquery.com/) / [jQuery UI](http://jqueryui.com/)
* [Grunt](http://gruntjs.com/)
* [Coffeescript](http://coffeescript.org/)
* [LESS](http://lesscss.org/)
* [Handlebars](http://handlebarsjs.com/)
* [lodash](http://lodash.com/)
* [Swipe](https://github.com/bradbirdsall/Swipe)
* [Sunrise](https://github.com/sjlu/sunrise)

## License

MIT.
