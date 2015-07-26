angular.module('events.ParseServices',[])

.factory('PushService',['$rootScope', function($rootScope){


	return {

		init: function() {


		},

		send: function(channel, message) {

			//var oneDay = new Date();

			Parse.Push.send({
			  channels: [ channel ],
			  data: {
			    //action: '',
			    //expiration_time: oneDay,
			    alert: message,
			    badge: 'Increment',
			    title: "New message"
			  }
			}, {
			  success: function() {
			    // Push was successful
			  },
			  error: function(error) {
			    // Handle error
			    console.log('Push send Error: 'error);
			  }
			});
		}

   }
}]);