angular.module('events.FriendServices',[])

.factory('Friend',['$rootScope', '$q', function($rootScope, $q){

	var Friend = Parse.Object.extend("UserFriend");

	var friends = [];
	var friendsExceptParticipants = [];

	return {

		getAll: function() {

			var deferred = $q.defer();
			console.log(friends);

			var query = new Parse.Query(Friend);
			query.equalTo("User", Parse.User.current() );
			query.equalTo("isActive", true );
			query.include("Friend");
			query.find({
			  success: function(objects) {
			  	console.log('Success: Friend.getAll()');
			  	friends = objects;
			    $rootScope.$apply(function() { deferred.resolve(objects); });

			  },
			  error: function(error) {
			    console.log("Error: " + error.code + " " + error.message);
			  }
			});

			return deferred.promise;

		},

		getAllExceptParticipants: function(myEvent) {

			var deferred = $q.defer();
			console.log(friends);

			var Participant = Parse.Object.extend("EventParticipant");

			var query = new Parse.Query(Friend);
			query.equalTo("User", Parse.User.current() );
			query.equalTo("isActive", true );
			query.include("Friend");

			var innerQuery = new Parse.Query(Participant);
			innerQuery.equalTo("Event", myEvent );
			//query.doesNotMatchKeyInQuery("Friend", "User", innerQuery);

			query.find({
			  success: function(objects) {
			  	console.log('Success: Friend.getAllExceptParticipants()');
			  	console.log('friendsExceptParticipants:', objects);
			  	friendsExceptParticipants = objects;
			    $rootScope.$apply(function() { deferred.resolve(objects); });

			  },
			  error: function(error) {
			    console.log("Error: " + error.code + " " + error.message);
			  }
			});

			return deferred.promise;

		},

		newFriend: function(user) {
			var friend = new Friend();

            friend.set('User', Parse.User.current());
            friend.set('Friend', user);

            return friend;

		}

   }
}]);