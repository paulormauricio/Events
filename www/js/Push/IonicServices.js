angular.module('events.IonicServices',[])

.factory('PushService',['$ionicUser', '$rootScope', function($ionicUser, $rootScope){

	$rootScope.$on('$cordovaPush:tokenReceived', function(event, data) {
		alert("Successfully registered token " + data.token);
		console.log('Ionic Push: Got token ', data.token, data.platform);
		//$scope.token = data.token;
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
						// console.log(notification);
						return true;
					}
				});


		    });

		    return;

		}

   }
}]);