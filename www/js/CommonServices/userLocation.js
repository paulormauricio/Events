angular.module('common.GeolocationServices',['geolocation'])

.factory('userlocation', ['$timeout', '$rootScope', '$q', '$cordovaGeolocation', 'geolocation', function( $timeout, $rootScope, $q, $cordovaGeolocation, geolocation) {

    return {
        get: function () {

        	var deferred = $q.defer();
try {
        	if( ionic.Platform.isIOS() || ionic.Platform.isAndroid() || ionic.Platform.isWindowsPhone() ) {
	        	$cordovaGeolocation.getCurrentPosition()
		            .then(function (position) {
		            	alert('userlocation: A obter posição.');
		                var glocation = {
			                lat: position.coords.latitude,
			                lng: position.coords.longitude
			            };

			            $timeout(function() {
			            	$rootScope.$apply(function() { deferred.resolve(glocation); });
		            	})

		            }, function (error) {
		                console.log('Geolocation error: ', error);
		                alert('Geolocation error: ', error);
		            });
            }
            else {
            	
            	geolocation.getLocation().then(function(position){
			    	var glocation = {
		    			lat: position.coords.latitude, 
		    			lng: position.coords.longitude
		    		};
		    		
		    		// Workaround para contornar o erro "$digest already in progress"
			    	$timeout(function() {
			    		$rootScope.$apply(function() { deferred.resolve(glocation); });
		    		})

			    });
            }
            }
catch(err) {
    alert( 'userlocation Error: '+err.message);
}
            return deferred.promise;
        }

    }

}]);