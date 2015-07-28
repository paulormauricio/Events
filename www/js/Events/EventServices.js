angular.module('events.EventServices',[])


.service('Event',['$rootScope', '$q' , function($rootScope, $q ){

	var Event = Parse.Object.extend("Event");
	var Participant = Parse.Object.extend("Participant");

	this.myEvent = null;

	this.showEvent = {};


	this.getMyEvents = function() {
			var deferred = $q.defer();

			var query = new Parse.Query(Event);
			var innerQuery = new Parse.Query(Participant);

			innerQuery.matchesQuery("Event", query);
			innerQuery.equalTo("User", Parse.User.current() );
			innerQuery.equalTo("isHidden", false );
			innerQuery.equalTo("isGoing", true );
			innerQuery.include("Event");

			innerQuery.find({
			  success: function(objects) {
			  	console.log('Events List get successfully!');

				var results = [];

				angular.forEach(objects, function(object, key) {
					var result = {};
					result.id = object.get('Event').id;
					result.name = object.get('Event').get('name');
					result.theme = object.get('Event').get('theme');
					result.place_id = object.get('Event').get('place_id');
					result.place_name = object.get('Event').get('place_name');
					result.place_address = object.get('Event').get('place_address');
					result.place_image_url = object.get('Event').get('place_image_url');
					result.place_lat = object.get('Event').get('place_lat');
					result.place_lng = object.get('Event').get('place_lng');
					result.date = object.get('Event').get('date');
					this.push(result);
				}, results);

			    $rootScope.$apply(function() { deferred.resolve(results); });

			  },
			  error: function(error) {
			    alert("getMyEvents Error: " + error.code + " " + error.message);
			  }
			});
			return deferred.promise;
		};

	this.getNew = function() {
			var deferred = $q.defer();

			var query = new Parse.Query(Event);
			var innerQuery = new Parse.Query(Participant);

			innerQuery.matchesQuery("Event", query);
			innerQuery.equalTo("User", Parse.User.current() );
			innerQuery.equalTo("isHidden", false );
			innerQuery.equalTo("isGoing", false );
			innerQuery.include("Event");

			innerQuery.find({
			  success: function(objects) {
			  	console.log('Events List get successfully!');

				var results = [];

				angular.forEach(objects, function(object, key) {
					var result = {};
					result.id = object.get('Event').id;
					result.name = object.get('Event').get('name');
					result.theme = object.get('Event').get('theme');
					result.place_id = object.get('Event').get('place_id');
					result.place_name = object.get('Event').get('place_name');
					result.place_address = object.get('Event').get('place_address');
					result.place_image_url = object.get('Event').get('place_image_url');
					result.place_lat = object.get('Event').get('place_lat');
					result.place_lng = object.get('Event').get('place_lng');
					result.date = object.get('Event').get('date');
					this.push(result);
				}, results);

			    $rootScope.$apply(function() { deferred.resolve(results); });

			  },
			  error: function(error) {
			    alert("getNewEvent Error: " + error.code + " " + error.message);
			  }
			});
			return deferred.promise;
		};

	this.get = function(id) {
			var deferred = $q.defer();

			var query = new Parse.Query(Event);
			query.equalTo("objectId", id );
			query.first({
			  success: function(object) {

			  	console.log('Event get successfully!');

			  	var result = {};

			  	if( object == undefined ) {
			  		result = object;
			  	}
				else {
					result.id = object.id;
					result.name = object.get('name');
					result.theme = object.get('theme');
					result.place_id = object.get('place_id');
					result.place_name = object.get('place_name');
					result.place_address = object.get('place_address');
					result.place_image_url = object.get('place_image_url');
					result.place_lat = object.get('place_lat');
					result.place_lng = object.get('place_lng');
					result.date = object.get('date');
					result.participants = null;
				}

				this.showEvent = result;
				
			  	$rootScope.$apply(function() { deferred.resolve(result); });

			  },
			  error: function(error) {
			    alert("getEvent Error: " + error.code + " " + error.message);
			  }
			});
			return deferred.promise;
		};

	this.save = function(isNew) {
			isNew = typeof isNew !== 'undefined' ? isNew : false;
			var deferred = $q.defer();

			var saveEvent = new Event();

			if(isNew) {
				this.myEvent.createdBy = Parse.User.current();
			}
			else {
				saveEvent.id = this.myEvent.id;
			}
			var myEvent_temp = {
				id: 	this.myEvent.id,
				name: 	this.myEvent.name,
				theme: 	this.myEvent.theme,
				place_id: 	this.myEvent.place_id == undefined ? null : this.myEvent.place_id,
				place_name: this.myEvent.place_name == undefined ? null : this.myEvent.place_name,
				place_address: this.myEvent.place_address == undefined ? null : this.myEvent.place_address,
				place_image_url: this.myEvent.place_image_url == undefined ? null : this.myEvent.place_image_url,
				place_lat: 	this.myEvent.place_lat == undefined ? null : this.myEvent.place_lat,
				place_lng: 	this.myEvent.place_lng == undefined ? null : this.myEvent.place_lng,
				date: 		this.myEvent.date == undefined ? null : this.myEvent.date,
				createdBy:	this.myEvent.createdBy
			};

			saveEvent.save( myEvent_temp , {
			  success: function(newEvent) {
			  	console.log('Event saved successfully!');

			  	$rootScope.$apply(function() { deferred.resolve(newEvent); });

			  },
			  error: function(gameScore, error) {
			  	alert('Failed to create event: ' + error.message);
			  }
			});
			return deferred.promise;
		};

	this.resetMyEvent = function() {
		this.myEvent = null;
	};

	this.deletePlace = function() {
		this.myEvent.place_id = undefined;
		this.myEvent.place_name = undefined;
		this.myEvent.place_address = undefined;
		this.myEvent.place_lat = undefined;
		this.myEvent.place_lng = undefined;
		this.myEvent.place_image_url = undefined;

		this.save();
	}

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
	var Event = Parse.Object.extend("Event");
	var User = Parse.Object.extend("User");

	var participants = [];

	return {

		getAll: function(myEvent, isGoing) {
			var deferred = $q.defer();

			var thisEvent = new Event(); 
			thisEvent.id = myEvent.id;
			
			var query = new Parse.Query(Participant);
			query.equalTo("Event", thisEvent );
			query.equalTo("isHidden", false );
			if (isGoing) {
				query.equalTo("isGoing", true );
			}
			query.include("User");
			query.ascending("");
			query.find({
			  success: function(objects) {
			  	console.log('Participants List get successfully!');

				var results = [];

				angular.forEach(objects, function(object, key) {
					var result = {};
					result.id = object.get('User').id;
					result.participantId = object.id;
					result.facebookId = object.get('User').get('facebookId');
					result.first_name = object.get('User').get('first_name');
					result.last_name = object.get('User').get('last_name');
					result.isGoing = object.get('isGoing');
					result.isHidden = object.get('isHidden');
					this.push(result);
				}, results);

			    $rootScope.$apply(function() { deferred.resolve(results); });

			    participants = results;

			  },
			  error: function(error) {
			    console.log("Error: " + error.code + " " + error.message);
			  }
			});
			return deferred.promise;
		},

		store: function(myEvent, friend, isOwner) {

	  		var participant = new Participant();

	  		var saveEvent = new Event(); 
	  		saveEvent.id = myEvent.id;

	  		var user = new User(); 
	  		user.id = friend.id;

            participant.set('Event', saveEvent);
            participant.set('User', user);
            participant.set('isSeen', isOwner);
            participant.set('isHidden', false);
            participant.set('isNotified', isOwner);
			participant.set('isGoing', isOwner);

			var query = new Parse.Query(Participant);
			query.equalTo("Event", saveEvent );
			query.equalTo("User", user );

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

		},

		update: function(participantId, isSeen, isHidden, isGoing) {

	  		var participant = new Participant();

	  		participant.id = participantId;
            participant.set('isGoing', isGoing);
            participant.set('isHidden', isHidden);
            participant.set('isSeen', isSeen);

			participant.save();
			console.log('Participant updated successfully!');
		},

		updateByEvent: function(saveEvent, user, isGoing) {

	  		var queryEvent = new Event(); 
	  		queryEvent.id = saveEvent.id;

			var query = new Parse.Query(Participant);
			query.equalTo("Event", queryEvent );
			query.equalTo("User", user );

			query.first({
			  success: function(participant) {

			  	if (participant.id != undefined) {
                    console.log('Participant updated successfully!');
		            participant.set('isGoing', isGoing);
		            participant.set('isHidden', false);

					participant.save();
			  	}
			  	else {
			  		console.log('Warning: Participant not found! ', participant);
			  	}

			  },
			  error: function(error) {
			    console.log("Error: " + error.code + " " + error.message);
			  }
			});
		},

		delete: function (participantId) {
			var participant = new Participant();
			participant.id = participantId;
			participant.destroy({
				success: function(myObject) {
					console.log('Participant removed :', participantId);
				},
				error: function(myObject, error) {
			    console.log("Error: " + error.code + " " + error.message);
				}
			});

		}

   }
}])

.factory('Theme',['$rootScope', '$q', function($rootScope, $q){

	var themes = [
		{name: 'cocktail', 	tags_en_us: 'drinks, cocktails', 	tags_pt_pt: 'bebidas, beber, copo, cocktails'},
		{name: 'drinks', 	tags_en_us: 'drinks, party', 		tags_pt_pt: 'bebidas, beber, copo, festa'},
		{name: 'food', 		tags_en_us: 'dinner, lunch, food', 	tags_pt_pt: 'jantar, comer, almoçar, almoço'},
		{name: 'football', 	tags_en_us: 'play, football', 		tags_pt_pt: 'jogar, futebol, bola'},
		{name: 'running', 	tags_en_us: 'run, running', 		tags_pt_pt: 'correr, corrida, caminhar, caminhada'}
	];

	return {

		getAll: function() {
			var deferred = $q.defer();

			setTimeout(function() {
				$rootScope.$apply(function() { deferred.resolve(themes); });
			}, 1000);

			return deferred.promise;
		}

   }
}]);
