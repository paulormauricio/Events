angular.module('events.FriendControllers',[])

.controller('FriendsListController',['$scope','$ionicLoading', 'Friend',function($scope,$ionicLoading,Friend){
    
    
    $scope.loadingIndicator = $ionicLoading.show({
        content: 'Loading Data',
        animation: 'fade-in',
        showBackdrop: false,
        maxWidth: 200,
        showDelay: 500
    });

    Friend.getAll().then(function(objects) {
    	$scope.objects = objects;
        $ionicLoading.hide();
    });

}]);