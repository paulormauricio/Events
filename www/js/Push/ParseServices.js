angular.module('events.ParseServices',[])

.factory('PushService',['$rootScope', function($rootScope, parsePlugin){

	var appId = '3JNm1SIMsSFg9dURqfXPon40ttp1lxoE5eQKG2XQ';
	var clientKey = 'OeC50st0M2iByVBzoCBfS6arUJ7mgj4Lb4SMNvN5';

	return {

		init: function() {
			console.log('Entrou no Push Parse Init()');
			parsePlugin.initialize(appId, clientKey, function() {

			    parsePlugin.subscribe('SampleChannel', function() {

			        parsePlugin.getInstallationId(function(id) {

			            /**
			             * Now you can construct an object and save it to your own services, or Parse, and corrilate users to parse installations
			             */
			             var install_data = {
			                installation_id: id,
			                channels: ['SampleChannel']
			             };

			             console.log('Parse instalation: ', install_data);
			             

			        }, function(e) {
			            alert('error');
			        });

			    }, function(e) {
			        alert('error');
			    });

			}, function(e) {
			    alert('error');
			});
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
			    console.log('Push send Error: ',error);
			  }
			});
		}

   }
}]);