angular.module('events.FriendControllers',[])

.controller('FriendsListController',['$scope','$ionicLoading', 'Friend',function($scope,$ionicLoading,Friend){
    
    $scope.loadingIndicator = $ionicLoading.show({showBackdrop: false});

    Friend.getAll().then(function(objects) {
    	$scope.objects = objects;
        $ionicLoading.hide();
    });

}]);