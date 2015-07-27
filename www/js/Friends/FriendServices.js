angular.module('events.FriendServices',[])

.factory('Friend',['$rootScope', '$q', function($rootScope, $q){

	var Friend = Parse.Object.extend("Friend");

	var friends = [];
	var friendsExceptParticipants = [];

	return {

		getAll: function() {

			var deferred = $q.defer();

			var query = new Parse.Query(Friend);
			query.equalTo("User", Parse.User.current() );
			query.equalTo("isActive", true );
			query.include("Friend");
			query.find({
			  success: function(objects) {			  
			  	console.log('Success: Friend.getAll()');

			  	friends = [];
				angular.forEach(objects, function(object, key) {
					var result = {};
					result.id = object.get('Friend').id;
					result.facebookId = object.get('Friend').get('facebookId');
					result.first_name = object.get('Friend').get('first_name');
					result.last_name = object.get('Friend').get('last_name');
					result.gender = object.get('Friend').get('gender');
					
					this.push(result);
				}, friends);

			    $rootScope.$apply(function() { deferred.resolve(friends); });

			  },
			  error: function(error) {
			    console.log("Error: " + error.code + " " + error.message);
			  }
			});

			return deferred.promise;

		},

		getAllExceptParticipants: function(myEvent) {

			var deferred = $q.defer();

			var Participant = Parse.Object.extend("Participant");

			var query = new Parse.Query(Friend);
			query.equalTo("User", Parse.User.current() );
			query.equalTo("isActive", true );
			query.include("Friend");
			//query.ascending("");

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