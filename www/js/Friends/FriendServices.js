angular.module('events.FriendServices',[])

.factory('Friend',['$rootScope', '$q', function($rootScope, $q) {

	var _db = new PouchDB('closeFriends', {adapter: 'websql'});
	var _closeFriends = [];

	var Friend = Parse.Object.extend("Friend");

	var friends = [];
	var friendsExceptParticipants = [];

	function onDatabaseChange(change) {  
		console.log('----->  CloseFriends Database change: ', change);
	    var index = findIndex(_closeFriends, change.id);

	    if (change.deleted) {
	        if (_closeFriends[index]) {
	            _closeFriends.splice(index, 1); // delete
	        }
	    } else {
	        if (_closeFriends[index] && _closeFriends[index]._id === change.id) { 
	            _closeFriends[index] = change.doc; // update
	        } else {
	            _closeFriends.splice(index, 0, change.doc) // insert
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

		loadCloseFriends: function() {

			if( _db === undefined ) {
				alert('Close Friends Database not loaded!');
				return $q.when([]);
			}

		    if (_closeFriends.length == 0) {

		       return $q.when(_db.allDocs({ include_docs: true}))
		            .then(function(docs) {

		                _closeFriends = docs.rows.map(function(row) {
		                    row.doc.lastEventDate = row.doc.lastEventDate ? new Date(row.doc.lastEventDate) : undefined;
		                    return row.doc;
		                });

						console.log('_closeFriends: ', _closeFriends);

		                return _closeFriends;
		            });
		    } else {
		        // Return cached data as a promise
		        console.log('Close Friends Loaded from cache');
		        return $q.when(_closeFriends);
		    }

		},

		saveCloseFriend: function() {
			// Completar
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