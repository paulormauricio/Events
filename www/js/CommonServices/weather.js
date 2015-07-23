angular.module('events.WeatherServices',[])


.factory('Weather',['$q', '$http', '$filter', function( $q, $http, $filter){


	var locale = Parse.User.current().get('locale').substring(0, 2);
    var URL = "https://api.worldweatheronline.com/free/v2/weather.ashx?";
    var KEY = "eedf22d8e65bce4afbed9d86c0d38";

    var time = null;

	return {

		get: function(date, location) {

			time = $filter('date')(date, 'HH');
			date = $filter('date')(date, 'yyyy-MM-dd');

			var query = location.lat+','+location.lng;

			//console.log('Weather URL: ', URL);

			var request = $http({
                        method: "get",
                        url: URL,
                        params: {
                            tp: '3',
                            cc: 'no',
                            num_of_days: 1,
                            format: 'json',
                            lang: locale,
                            key: KEY,
                            date: date,
                            q: query
                        }
                    });
			return( request.then( handleSuccess, handleError ) );
		}

   }

    function handleError( response ) {
        if (
            ! angular.isObject( response.data ) ||
            ! response.data.message
            ) {
            return( $q.reject( "An unknown error occurred." ) );
        }
        return( $q.reject( response.data.message ) );
    }
    function handleSuccess( response ) {
    	var index = Math.round(time * 3 / 8) - 1;
    	var data = response.data.data.weather[0].hourly[index];
    	var result = {
    		code: data.weatherCode,
    		desc: data.weatherDesc[0].value,
    		icon_url: data.weatherIconUrl[0].value,
    		tempC: data.FeelsLikeC,
    		tempF: data.FeelsLikeF,
    	};
    	if( locale != 'en' ) result.desc = data['lang_'+locale][0].value;
        return( result );
    }
}]);
