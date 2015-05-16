angular.module('events.EventServices',[])

.factory('Event',['$rootScope', '$q', function($rootScope, $q){

	var Event = Parse.Object.extend("Event");

	return {

		getAll: function() {
			var deferred = $q.defer();

			var query = new Parse.Query(Event);
//			query.equalTo("User", Parse.User.Current() );
			query.find({
			  success: function(objects) {
			  	console.log('Events List get successfully!');

			    $rootScope.$apply(function() { deferred.resolve(objects); });

			  },
			  error: function(error) {
			    console.log("Error: " + error.code + " " + error.message);
			  }
			});
			return deferred.promise;
		},

		get: function(id) {
			
			var query = new Parse.Query(Event);
			query.equalTo("objectId", id );
			query.first({
			  success: function(object) {
			  	console.log('Event get successfully!');
			    return result;
			  },
			  error: function(error) {
			    console.log("Error: " + error.code + " " + error.message);
			  }
			});
		},

		create: function(data) {
			var deferred = $q.defer();

			var newEvent = new Event();

			newEvent.set("name", data.name);

			newEvent.save(null, {
			  success: function(newEvent) {
			  	console.log('Event created successfully!');
			  	$rootScope.$apply(function() { deferred.resolve(true); });
			  },
			  error: function(gameScore, error) {
			  	console.log('Failed to create event: ' + error.message);
			  }
			});
			return deferred.promise;
		}

   }
}]);