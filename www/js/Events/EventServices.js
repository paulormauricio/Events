angular.module('events.EventServices',[])


.service('Event',['$rootScope', '$q', '$timeout', '$filter', function($rootScope, $q, $timeout, $filter){

console.log('<------ Start Events ----------->');

	var _db = new PouchDB('events', {adapter: 'websql'});
	var _myEvents = [];

	var Event = Parse.Object.extend("Event");
	var Participant = Parse.Object.extend("Participant");

	this.isForceGetEvents = false;
	this.myEvent = null;
	this.showEvent = {};


    // Listen for changes on the database.
    //_db.changes({ live: true, since: 'now', include_docs: true}).on('change', onDatabaseChange);

	this.loadMyEvents = function() {

		if( this.isForceGetEvents ) {
			console.log('Force get MyEvents');
			this.isForceGetEvents = false;
			return this.getMyEvents();
		}
		if( _db === undefined ) {
			alert('Database not loaded!');
			return this.getMyEvents();
		}

	    if (_myEvents.length == 0) {

	    	var currDate = $filter('date')(new Date(), 'yyyy-MM-dd' );

	       return $q.when(_db.createIndex({
					index: {fields: ['date']}
				})
				.then(function () {
					return _db.find({
						selector: {date: {$gte: currDate}}
					});
				})
				.then(function(docs) {

	                _myEvents = docs.docs.map(function(doc) {
	                    doc.date = doc.date ? new Date(doc.date) : undefined;
	                    doc.updatedAt = doc.updatedAt ? new Date(doc.updatedAt) : undefined;

						// Unserialize participants
						doc.participants = angular.fromJson(doc.participants);

	                    return doc;
	                });
	                console.log('_myEvents(query1): ', _myEvents);
					
					//return _myEvents;
					return _db.find({
						selector: {date: {$exists: false}}
					});

				})
				.then(function(docs){
					var events_withoutDate = [];
	                events_withoutDate = docs.docs.map(function(doc) {
	                    doc.date = doc.date ? new Date(doc.date) : undefined;
	                    doc.updatedAt = doc.updatedAt ? new Date(doc.updatedAt) : undefined;

						// Unserialize participants
						doc.participants = angular.fromJson(doc.participants);

	                    return doc;
	                });
	                _myEvents = _myEvents.concat(events_withoutDate);
	                console.log('_myEvents(query2): ', _myEvents);
	                return _myEvents;
				})
				.catch(function(err){console.log('Load Docs Error: ', err); return [];}));

	    } else {
	        // Return cached data as a promise
	        console.log('Loaded from cache');
	        return $q.when(_myEvents);
	    }
	}


	function onDatabaseChange(change) {  
console.log('----->  Database change: ', change);
	    var index = findIndex(_myEvents, change.id);

	    if (change.deleted) {
	        if (_myEvents[index]) {
	            _myEvents.splice(index, 1); // delete
	        }
	    } else {
	        if (_myEvents[index] && _myEvents[index]._id === change.id) { 
	            _myEvents[index] = change.doc; // update
	        } else {
	            _myEvents.splice(index, 0, change.doc) // insert
	        }
	    }

	}
	// Binary search, the array is by default sorted by _id.
	function findIndex(array, id) {  
	    var low = 0, high = array.length, mid;
	    while (low < high) {
		    mid = (low + high) >>> 1;
		    array[mid]._id < id ? low = mid + 1 : high = mid
	    }
	    return low;
	}

	this.getMyEvents = function() {
		_myEvents = [];
		var deferred = $q.defer();

		// Validate network connection
		if( $rootScope.isOffline ) {
			$timeout(function() {
				$rootScope.$apply(function() { deferred.resolve([]); });
			}, 100);
			return deferred.promise;
		}

		var query = new Parse.Query(Event);
		var innerQuery = new Parse.Query(Participant);

		innerQuery.matchesQuery("Event", query);
		innerQuery.equalTo("User", Parse.User.current() );
		innerQuery.equalTo("isHidden", false );
		innerQuery.equalTo("isGoing", true );
		innerQuery.include("Event");

		innerQuery.find({
		  success: function(objects) {
		  	console.log('getMyEvents: List get successfully!');
		  	var currDate = $filter('date')(new Date(), 'yyyy-MM-dd');
		  	var results = [];
			angular.forEach(objects, function(object) {

				var result = {};
				result.id = object.get('Event').id;
				result._id = object.get('Event').id;

				result.name = object.get('Event').get('name');
				result.theme = object.get('Event').get('theme');
				result.place_id = object.get('Event').get('place_id');
				result.place_name = object.get('Event').get('place_name');
				result.place_address = object.get('Event').get('place_address');
				result.place_image_url = object.get('Event').get('place_image_url');
				result.place_lat = object.get('Event').get('place_lat');
				result.place_lng = object.get('Event').get('place_lng');
				result.date = object.get('Event').get('date');
				result.updatedAt = object.get('Event').updatedAt;

				//Add to local database
				$q.when(_db.get(result._id)
					.then(function(doc) {
						doc.updatedAt = new Date(doc.updatedAt);
						if( result.updatedAt > doc.updatedAt  ) {
							result._rev = doc._rev;
							return _db.put( result );
						}
					})
					//.then(function(res){ console.log('Imported Event: ', res);})
					.catch(function (err) { 
						if( err.name === 'not_found' ) {
							_db.put(result).then(function(res){console.log('Put new event: ', res);}).catch(function(err){console.log('Import/Put new Event: ', err);})
						}
						else {
							console.log('Import Event Error: ', err); 
						}
					})
				);
				var eventDate = $filter('date')(result.date, 'yyyy-MM-dd');

				if( result.date == null || result.date === undefined || currDate <= eventDate ) this.push(result);

			}, results);

			_myEvents = results;

		    $rootScope.$apply(function() { deferred.resolve(results); });

		  },
		  error: function(error) {
		    console.log("getMyEvents Error: " + error.code + " " + error.message);
		    //throw new Error(error); 
		    $rootScope.$apply(function() { deferred.resolve([]); });
		  }
		});
		return deferred.promise;
	};

	this.getNew = function() {
		var deferred = $q.defer();

		// Validate network connection
		if( $rootScope.isOffline ) {
			$timeout(function() {
				$rootScope.$apply(function() { deferred.resolve([]); });
			}, 100);
			return deferred.promise;
		}

		var query = new Parse.Query(Event);
		var innerQuery = new Parse.Query(Participant);

		innerQuery.matchesQuery("Event", query);
		innerQuery.equalTo("User", Parse.User.current() );
		innerQuery.equalTo("isHidden", false );
		innerQuery.equalTo("isGoing", false );
		innerQuery.include("Event");

		innerQuery.find({
		  success: function(objects) {
		  	console.log('getNew: Events List get successfully!');

			var results = objects.map(function(object) {

				var result = {};
				result.id = object.get('Event').id;
				result._id = object.get('Event').id;
				result.name = object.get('Event').get('name');
				result.theme = object.get('Event').get('theme');
				result.place_id = object.get('Event').get('place_id');
				result.place_name = object.get('Event').get('place_name');
				result.place_address = object.get('Event').get('place_address');
				result.place_image_url = object.get('Event').get('place_image_url');
				result.place_lat = object.get('Event').get('place_lat');
				result.place_lng = object.get('Event').get('place_lng');
				result.date = object.get('Event').get('date');
				result.updatedAt = object.get('Event').updatedAt;

				return result;
			});

		    $rootScope.$apply(function() { deferred.resolve(results); });

		  },
		  error: function(error) {
		    console.log("getNewEvent Error: " + error.code + " " + error.message);
		    //throw new Error(error); 
		    $rootScope.$apply(function() { deferred.resolve([]); });
		  }
		});
		return deferred.promise;
	};


	this.loadEvent = function(id) {

		if( _db === undefined ) {
			alert('Database not loaded!');
			return {};
		}

       return $q.when(_db.get(id)
	       		.then(function (doc) {
console.log('Event loaded locally!');
					doc.date = doc.date ? new Date(doc.date) : undefined;
					// Unserialize participants
					doc.participants = angular.fromJson(doc.participants);

				  return doc;
				}).catch(function (err) {
				  console.log(err);
				})
			);
	};

	this.get = function(id) {

		if( $rootScope.isOffline ) {
			return this.loadEvent(id);
		}

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
				result._id = object.id;
				result.name = object.get('name');
				result.theme = object.get('theme');
				result.place_id = object.get('place_id');
				result.place_name = object.get('place_name');
				result.place_address = object.get('place_address');
				result.place_image_url = object.get('place_image_url');
				result.place_lat = object.get('place_lat');
				result.place_lng = object.get('place_lng');
				result.date = object.get('date');
				result.updatedAt = object.updatedAt;
				result.participants = null;

				this.showEvent = result;

				_db.get(object.id)
				.then(function (doc) {
					onDatabaseChange({doc: result, deleted: false, id: result._id});
				})
				.catch(function(error) {
					if( error.name === 'not_found') {
						console.log('Document not found in local DB');
					}
					else {
						console.log('Get Doc error: ', error);
					}
				});

			}
			
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

			  	myEvent_temp.id = newEvent.id;
				myEvent_temp._id = newEvent.id;
				delete myEvent_temp.createdBy;
				$q.when(_db.put(myEvent_temp));
				
				onDatabaseChange({doc: myEvent_temp, deleted: false, id: myEvent_temp._id});

			  	$rootScope.$apply(function() { deferred.resolve(newEvent); });

			  },
			  error: function(gameScore, error) {
			  	alert('Failed to create event: ' + error.message);
			  }
			});


			return deferred.promise;
		};

	this.updateEventLocally = function(myEvent) {

		$q.when(_db.get(myEvent.id)
			.then(function (doc) {
				doc.updatedAt = new Date(doc.updatedAt);

				if( myEvent.updatedAt > doc.updatedAt  ) {
					console.log('updateEventLocally');
					myEvent._id = myEvent.id;
					myEvent._rev = doc._rev;
					// Serialize participants
					myEvent.participants = angular.toJson(myEvent.participants, false);

					_db.put(myEvent);
					// Unserialize participants
					myEvent.participants = angular.fromJson(myEvent.participants);
					onDatabaseChange({doc: myEvent, deleted: false, id: myEvent._id});
				}
			})
			.catch(function(error) {
				if( error.name === 'not_found') {
					console.log('Document not found in local DB');
				}
				else {
					console.log('Get Doc error: ', error);
				}
			})
		);

	}

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

	this.leaveEvent = function(myEvent) {
		//$q.when(_db.remove(myEvent));
	}

	this.destroy = function() {
		_db.destroy().then(function() { console.log('Events DB deleted') });
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

.factory('Theme',['$rootScope', '$q', '$timeout', function($rootScope, $q, $timeout){

	var themes = [
		{name: 'beach', 	tags_en_us: 'beach, sand, sea, sun',	tags_pt_pt: 'praia, areia, mar, sol'},
		{name: 'burger', 	tags_en_us: 'hamburger, lunch, dinner',	tags_pt_pt: 'humburger, comer, almoçar, jantar'},
		{name: 'cocktail', 	tags_en_us: 'drinks, cocktails', 		tags_pt_pt: 'bebidas, beber, copo, cocktails'},
		{name: 'drinks', 	tags_en_us: 'drinks, party', 			tags_pt_pt: 'bebidas, beber, copo, festa'},
		{name: 'food', 		tags_en_us: 'dinner, lunch, food', 		tags_pt_pt: 'jantar, comer, almoçar, almoço'},
		{name: 'football', 	tags_en_us: 'play, football', 			tags_pt_pt: 'jogar, futebol, bola'},
		{name: 'golf',	 	tags_en_us: 'golf, play',				tags_pt_pt: 'golf, jogar'},
		{name: 'rugby', 	tags_en_us: 'rugby, play',				tags_pt_pt: 'rugby, jogar, rugbi'},
		{name: 'running', 	tags_en_us: 'run, running', 			tags_pt_pt: 'correr, corrida, caminhar, caminhada'},
		{name: 'surf',	 	tags_en_us: 'surfing, waves',			tags_pt_pt: 'surfing, surfar, ondas'}
	];

	return {

		getAll: function() {
			var deferred = $q.defer();

			$timeout(function() {
				$rootScope.$apply(function() { deferred.resolve(themes); });
			}, 1000);

			return deferred.promise;
		}

   }
}]);
