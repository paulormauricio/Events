angular.module('events.IonicServices',[])

.factory('PushService',['$ionicUser', '$rootScope', '$ionicPush', '$http', function($ionicUser, $rootScope, $ionicPush, $http){

	var message = {
		"tokens":[],
		"notification":{
			"alert": undefined,
			"ios":{
				"badge":1,
				"sound":"ping.aiff",
				"expiry": 1423238641,
				"priority": 10,
				"contentAvailable": true,
				"payload":{
					"key1":"value",
					"key2":"value"
				}
			},
			"android":{
				"collapseKey":"foo",
				"delayWhileIdle":true,
				"timeToLive":300,
				"payload":{
					"key1":"value",
					"key2":"value"
				}
			}
		}
	}

	$rootScope.$on('$cordovaPush:tokenReceived', function(event, data) {
		alert("Successfully registered token " + data.token);
		console.log('Ionic Push: Got token ', data.token, data.platform);

		Parse.User.current().set('device_token', data.token);
		Parse.User.current().set('device_platform', data.platform);
		Parse.User.current().save();
		
	});

	return {

		init: function() {


		    console.log('Ionic User: Identifying with Ionic User service');

		    var user = $ionicUser.get();
		    if(!user.user_id) {
		      // Set your user_id here, or generate a random one.
		      //user.user_id = $ionicUser.generateGUID();
		      user.user_id = Parse.User.current().id;
		    };

		    // Add some metadata to your user object.
		    angular.extend(user, {
		      name: Parse.User.current().get('name')
		    });

		    // Identify your user with the Ionic User Service
		    $ionicUser.identify(user).then(function(){
		      
				alert('Identified user ' + user.name + '\n ID ' + user.user_id);

				console.log('Ionic Push: Registering user');

				// Register with the Ionic Push service.  All parameters are optional.
				$ionicPush.register({
					canShowAlert: true, //Can pushes show an alert on your screen?
					canSetBadge: true, //Can pushes update app icon badges?
					canPlaySound: true, //Can notifications play a sound?
					canRunActionsOnWake: true, //Can run actions outside the app,
					onNotification: function(notification) {
						// Handle new push notifications here
						console.log('Push Notification :', notification);
						//alert('Received push: '+notification);
						return true;
					}
				});

		    });

		    return;

		},

		send: function(tokens, msg) {

			if( alert == undefined || tokens == undefined) {
				//return false;
				tokens = ['DEV-f9c8747c-7f67-4255-8bea-0204c564f94c'];
				msg = 'Hello world';
			}

			message.notification.alert = msg;
			message.tokens = tokens;

			var url = 'https://push.ionic.io/api/v1/push?';

			var request = {
				method: 'POST',
				url: url,
				headers: {
					'Content-Type': 'application/json',
					'X-Ionic-Application-Id': '0d7d2a38'
				},
				data: message
			}

			$http(request).
				success(function(data, status) {
					
					console.log('Send Push Success:', data);

				}).
				error(function(error, status) {
					console.log('Send Push Error: ', error);
				});

		}

   }
}]);