angular.module('events.ProfileServices',[])

.factory('Profile',['$rootScope', '$q', function($rootScope, $q){

	var Friend = Parse.Object.extend("UserFriend");

	return {

		getTotalFriends: function() {
			var deferred = $q.defer();

			var query = new Parse.Query(Friend);
			query.equalTo("User", Parse.User.current() );
			query.equalTo("isActive", true );
			query.count({
			  success: function(count) {
			  	console.log('Total friends = ' + count);

			    $rootScope.$apply(function() { deferred.resolve(count); });

			  },
			  error: function(error) {
			    console.log("Error: " + error.code + " " + error.message);
			  }
			});
			return deferred.promise;
		}

   }
}]);