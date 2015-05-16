angular.module('events.EventControllers',[])

.controller('EventsListController',['$scope', '$ionicLoading', 'Event',function($scope,$ionicLoading,Event){
    

    $scope.loadingIndicator = $ionicLoading.show({
        content: 'Loading events',
        animation: 'fade-in',
        showBackdrop: false,
        maxWidth: 200,
        showDelay: 500
    });

    Event.getAll().then(function(objects) {
        $scope.objects = objects;
        $ionicLoading.hide();
    });
    
    $scope.doRefresh = function() {
        Event.getAll().then(function(objects) {
            $scope.objects = objects;
            $scope.$broadcast('scroll.refreshComplete');
        });
    }


}])

.controller('EventEditController',
        [
            '$scope', 
            '$state', 
            '$stateParams',
            '$ionicLoading',
            'Event', 
            'Friend', 
            function(
                $scope,
                $state, 
                $stateParams,
                $ionicLoading, 
                Event, 
                Friend
            )
        {


//    $scope.object = $stateParams.object;

    $scope.storeName = function(object){
        console.log('object:');
        console.log(object);
        // if( angular.isObject($stateParams.object) )
        //     $state.go('editEventFriends({object: '+$scope.object+'})')
        // else
        //     $state.go('editEventFriends')
    }

    $scope.create = function(){
        console.log($scope);
        console.log($scope.name);
        // Event.create($scope.object).then( function() {
        //     $state.go('tab.events');
        // });
    }

    $scope.loadFriends = function(){
        
        console.log('chegou');

    }


}])

.controller('EventShowController',['$scope','Event','$state','$stateParams',function($scope,Event,$state,$stateParams){

	var obj = angular.fromJson($stateParams.object);
    $scope.object = obj;

}]);