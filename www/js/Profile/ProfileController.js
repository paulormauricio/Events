angular.module('events.ProfileControllers', [])

  .controller('ProfileController', ['$scope', '$state', 'Profile', function($scope, $state, Profile) {

	console.log('');
	console.log('<<<<<<-----------   Settings Screen  ---------->>>>>');

    $scope.facebookId = Parse.User.current().get('facebookId');

    Profile.getTotalFriends().then( function(count){
      $scope.total_friends = count;
    });

    
  }]);
