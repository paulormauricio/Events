angular.module('events.EventServices',[])


.service('Event',['$rootScope', '$q', function($rootScope, $q){

	var Event = Parse.Object.extend("Event");

	this.eventList = [];

	this.myEvent = new Event();


	this.getAll = function() {
			var deferred = $q.defer();

			var query = new Parse.Query(Event);
			query.equalTo("createdBy", Parse.User.current() );
			query.find({
			  success: function(objects) {
			  	console.log('Events List get successfully!');

			    $rootScope.$apply(function() { deferred.resolve(objects); });

			    this.eventList = objects;

			  },
			  error: function(error) {
			    console.log("Error: " + error.code + " " + error.message);
			  }
			});
			return deferred.promise;
		};

	this.get = function(id) {
			
			var query = new Parse.Query(Event);
			query.equalTo("objectId", id );
			query.first({
			  success: function(object) {
			  	console.log('Event get successfully!');
			  	this.myEvent = result;
			    return result;
			  },
			  error: function(error) {
			    console.log("Error: " + error.code + " " + error.message);
			  }
			});
		};

	this.save = function() {
			var deferred = $q.defer();

			this.myEvent.set('createdBy', Parse.User.current());

			this.myEvent.save(null, {
			  success: function(newEvent) {
			  	console.log('Event created successfully!');
			  	$rootScope.$apply(function() { deferred.resolve(true); });

			  	this.eventList.push(newEvent);

			  },
			  error: function(gameScore, error) {
			  	console.log('Failed to create event: ' + error.message);
			  }
			});
			return deferred.promise;
		};

	this.resetMyEvent = function() {
		this.myEvent = new Event();
	};

	this.selectTheme = function(theme) {
		this.myEvent.set('theme', theme);
	};

}])

.factory('EventParticipant',['$rootScope', '$q', function($rootScope, $q){

	var Participant = Parse.Object.extend("EventParticipant");

	var participants = [];

	return {

		getAll: function(myEvent) {
			var deferred = $q.defer();

			var query = new Parse.Query(Participant);
			query.equalTo("Event", myEvent );
			query.equalTo("isHidden", false );
			query.include("User");
			query.find({
			  success: function(objects) {
			  	console.log('Participants List get successfully!');

			    $rootScope.$apply(function() { deferred.resolve(objects); });

			    participants = objects;

			  },
			  error: function(error) {
			    console.log("Error: " + error.code + " " + error.message);
			  }
			});
			return deferred.promise;
		},

		store: function(myEvent, friend) {

	  		var participant = new Participant();
            participant.set('Event', myEvent);
            participant.set('User', friend);
            participant.set('isSeen', false);
            participant.set('isNotified', false);

			var query = new Parse.Query(Participant);
			query.equalTo("Event", myEvent );
			query.equalTo("User", friend );
			query.first({
			  success: function(object) {

			  	if (object === undefined) {
			  		console.log('Participant saved successfully!');
                    participant.save();

			  	}

			  },
			  error: function(error) {
			    console.log("Error: " + error.code + " " + error.message);
			  }
			});


            return participant;

		},

		delete: function (participant) {
			
			participant.destroy({
				success: function(myObject) {
					// The object was deleted from the Parse Cloud.
				},
				error: function(myObject, error) {
			    console.log("Error: " + error.code + " " + error.message);
				}
			});

		}

   }
}])

.factory('Theme',['$rootScope', '$q', function($rootScope, $q){

	var Theme = Parse.Object.extend("Theme");

	return {

		getAll: function() {
			var deferred = $q.defer();

			var query = new Parse.Query(Theme);
			query.equalTo("isActive", true );
			query.find({
			  success: function(objects) {
			  	console.log('Themes List get successfully!');

			  	angular.forEach(objects, function(object, key) {
			  		var locale = Parse.User.current().get('locale').toLowerCase();

			  		var name = '';
			  		if(object.has('name_'+locale))
			  			name = object.get('name_'+locale);
			  		else
			  			name = object.get('name_en_us');

			  		object.set('name', name);
			  	});

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
