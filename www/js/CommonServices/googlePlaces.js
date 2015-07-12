angular.module('events.GooglePlacesServices',[])

.factory('googlePlaces', ['$timeout', '$rootScope', '$q', '$http', function( $timeout, $rootScope, $q, $http) {

//https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=-33.8670522,151.1957362&radius=500&types=food&name=cruise&key=AIzaSyDj5NWOTJPip1I2LAA2BgvB50UzzYECgeQ

	var url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=-33.8670522,151.1957362&radius=500&types=food&name=cruise&key=AIzaSyCGKSYZEuXqC3PrDavzGUcn07n97MyNdjU';


    return {
        getPhoto: function () {

        	$http.get(url, config).
				success(function(data, status, headers, config) {
				
					return true;

				}).
				error(function(data, status, headers, config) {
					return 'erro';
				});

			return false;
        	
        }

    }
}]);