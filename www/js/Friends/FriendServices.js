angular.module('events.FriendServices',[])

.factory('Friend',['$rootScope', '$q', function($rootScope, $q){

	var Friend = Parse.Object.extend("UserFriend");

	return {

		getAll: function() {
			var deferred = $q.defer();

			var query = new Parse.Query(Friend);
			query.equalTo("User", Parse.User.current() );
			query.equalTo("isActive", true );
			query.include("Friend");
			query.find({
			  success: function(objects) {
			  	console.log('Friends List get successfully!');

			    $rootScope.$apply(function() { deferred.resolve(objects); });

			  },
			  error: function(error) {
			    console.log("Error: " + error.code + " " + error.message);
			  }
			});
			return deferred.promise;
		}

   }
}]);