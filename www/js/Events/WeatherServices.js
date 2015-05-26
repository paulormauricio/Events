angular.module('events.WeatherServices',[])


.factory('Weather',['$q', '$http', function( $q, $http){


    var URL = "https://api.worldweatheronline.com/free/v2/weather.ashx?";
    var LOCATION = "q=";
    var numOfDays = "num_of_days=1";
    var format = "format=json";
    var lang = "lang=" + 'en';// Parse.User.current().get(locale).substring(0, 2);
    var KEY = "key=";
    var appKey = "eedf22d8e65bce4afbed9d86c0d38";

	return {

		get: function(date) {
			var deferred = $q.defer();

			//URL += numOfDays + '&' + KEY + '&' + lang  '&' + format + '&date=' + date + '$tp=1';

			$http.get( URL ).
			success(function(data, status, headers, config) {

				console.log('Weather data: ', data);

				$rootScope.$apply(function() { deferred.resolve(data); });

			}).
			error(function(data, status, headers, config) {
				console.log("HTTP Error status: " + status);
			});

			return deferred.promise;
		}

   }
}]);
