angular.module('events.ProfileControllers', [])

  .controller('ProfileController', ['$scope', '$state', 'Profile', function($scope, $state, Profile) {

    $scope.facebookId = Parse.User.current().get('facebookId');

    Profile.getTotalFriends().then( function(count){
      $scope.total_friends = count;
    });


    $scope.logout = function() {
      console.log('Logout');
       
      facebookConnectPlugin.logout(
        function (success) {
          $state.go('login');
        },
        function (failure) { console.log(failure) }
      );
      
      Parse.User.logOut();
      $state.go('login');
    };
    
  }]);
