angular.module('events.EventServices',[])


.service('Event',['$rootScope', '$q' , function($rootScope, $q ){

	var Event = Parse.Object.extend("Event");
	var Participant = Parse.Object.extend("Participant");

	this.eventList = [];

	this.myEvent = new Event();
	this.myEvent.set('totalParticipants', 0);
	this.myEvent.set('goingParticipants', 0);

	this.showEvent = {};


	this.getAll = function() {
			var deferred = $q.defer();

			var query = new Parse.Query(Event);
			var innerQuery = new Parse.Query(Participant);

			innerQuery.matchesQuery("Event", query);
			innerQuery.equalTo("User", Parse.User.current() );
			innerQuery.equalTo("isHidden", false );
			innerQuery.include("Event");
			innerQuery.include("Event.Theme");

			innerQuery.find({
			  success: function(objects) {
			  	console.log('Events List get successfully!');

				this.eventList = objects;

			    $rootScope.$apply(function() { deferred.resolve(objects); });

			  },
			  error: function(error) {
			    console.log("Error: " + error.code + " " + error.message);
			  }
			});
			return deferred.promise;
		};

	this.get = function(id) {
			var deferred = $q.defer();
			
			var query = new Parse.Query(Event);
			query.equalTo("objectId", id );
			query.include("Theme");
			query.first({
			  success: function(object) {
			  	console.log('Event get successfully!');

				this.showEvent = object;
				
			  	$rootScope.$apply(function() { deferred.resolve(object); });

			  },
			  error: function(error) {
			    console.log("Error: " + error.code + " " + error.message);
			  }
			});
			return deferred.promise;
		};

	this.save = function() {
			var deferred = $q.defer();

			this.myEvent.set('createdBy', Parse.User.current());

			this.myEvent.save(null, {
			  success: function(newEvent) {
			  	console.log('Event saved successfully!');

			  	this.myEvent = newEvent;

			  	$rootScope.$apply(function() { deferred.resolve(true); });

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
		//console.log('Theme: ', this.myEvent.get('Theme'));
		if( this.myEvent.has('Theme') ) {
			if( this.myEvent.get('Theme').id == theme.id ) 
				this.myEvent.unset('Theme');
			else
				this.myEvent.set('Theme', theme);
		}
		else
			this.myEvent.set('Theme', theme);
	};

	this.newParticipant = function() {
		this.myEvent.increment('totalParticipants');
		this.myEvent.save();
	}
	this.removeParticipant = function() {
		this.myEvent.increment("totalParticipants", -1);
		this.myEvent.save();
	}
	this.newGoingParticipant = function() {
		this.myEvent.increment('goingParticipants');
		this.myEvent.save();
	}	
	this.removeGoingParticipant = function() {
		this.myEvent.increment("goingParticipants", -1);
		this.myEvent.save();
	}

}])

.factory('Participant',['$rootScope', '$q', 'Event', function($rootScope, $q, Event){

	var Participant = Parse.Object.extend("Participant");

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
            participant.set('isHidden', false);
            participant.set('isNotified', false);

			var query = new Parse.Query(Participant);
			query.equalTo("Event", myEvent );
			query.equalTo("User", friend );
			query.first({
			  success: function(object) {

			  	if (object === undefined) {
			  		console.log('Participant saved successfully!');
                    participant.save();
                    Event.newParticipant();
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
					Event.removeParticipant();
					if(participant.get('isGoing)')) Event.removeGoingParticipant();
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

	var themes = [];

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
			  		if(object.has('name_'+locale)) {
			  			name = object.get('name_'+locale);
			  			tags = object.get('tags_'+locale);
			  		}
			  		else {
			  			name = object.get('name_en_us');
			  			tags = object.get('tags_en_us');
			  		}

			  		object.set('name', name);
			  		object.set('tags', tags);
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
