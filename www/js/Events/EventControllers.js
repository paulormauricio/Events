angular.module('events.EventControllers',[])

.controller('EventsListController',['$scope', '$ionicLoading', 'Event',function($scope,$ionicLoading,Event){
    

    $scope.loadingIndicator = $ionicLoading.show({
        content: 'Loading events',
        animation: 'fade-in',
        showBackdrop: false,
        maxWidth: 200,
        showDelay: 500
    });

    Event.getAll()
    .then(function(objects) {
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
            'EventParticipant',
            'Theme',
            function(
                $scope,
                $state, 
                $stateParams,
                $ionicLoading, 
                Event, 
                Friend,
                EventParticipant,
                Theme
            )
        {

    $scope.object = {};

    console.log( 'Event:', Event );

    $scope.loadingIndicator = $ionicLoading.show({
        content: 'Loading Data',
        animation: 'fade-in',
        showBackdrop: false,
        maxWidth: 200,
        showDelay: 500
    });

    $scope.storeName = function() {

        console.log('Event:', $scope.object);

        

        Event.myEvent.set('name', $scope.object.name);

        console.log('myEvent:', Event.myEvent);

        Event.save();

        $state.go('editEventFriends', {}, {reload: true});
    }

    $scope.storeFriends = function() {
        
        console.log('Store Friends');

    }

    $scope.create = function() {
        Event.create($scope.object).then( function() {
            $state.go('tab.events');
        });
    }

    $scope.loadThemes = function() {
        $scope.object.name = Event.myEvent.get('name');

        console.log('load past Events');

        Theme.getAll().then(function(themes){
            $scope.themes = themes;
            console.log('Themes: ', themes);
        });

        $ionicLoading.hide();
    }

    $scope.loadFriends = function() {
        console.log('chegou ao loadFriends');

        $scope.friends = [];
        $scope.invitedFriends = [];
        
        Friend.getAllExceptParticipants().then(function(friends) {

            $scope.friends = friends;

            console.log('friends: ', $scope.friends);

            EventParticipant.getAll(Event.myEvent).then(function(invitedFriends){
                $scope.invitedFriends = invitedFriends;
                console.log('invitedFriends: ', $scope.invitedFriends);
                $ionicLoading.hide();
            })
            .catch(function(fallback) {
                console.log('Error: ', fallback + '!!');
                $ionicLoading.hide();
            });
            
        })
        .catch(function(fallback) {
            console.log('Error: ', fallback + '!!');
            $ionicLoading.hide();
        });
    }

    $scope.inviteFriend = function(index) {
        console.log('chegou ao invite Friends. Index = ' + index);
        console.log('Selected friend: ', $scope.friends[index]);
        var participant = EventParticipant.store(Event.myEvent, $scope.friends[index].get('Friend'));
        $scope.invitedFriends.push( participant );
        $scope.friends.splice(index, 1);

    }

    $scope.uninviteFriend = function(index) {
        console.log('chegou ao uninvite Friends. Index = ' + index);

        var newFriend = Friend.newFriend($scope.invitedFriends[index].get('User'));

        EventParticipant.delete($scope.invitedFriends[index]);

        $scope.invitedFriends.splice(index, 1);
        $scope.friends.push( newFriend );
    }

    $scope.selectTheme = function(index) {
        console.log('chegou ao selectTheme. Index = ' + index);
        Event.selectTheme($scope.themes[index]);
    }

    $scope.notifyParticipants = function() {
        console.log('Notify Participants');
    }

}])

.controller('EventShowController',['$scope','Event','$state','$stateParams',function($scope,Event,$state,$stateParams){

	var obj = angular.fromJson($stateParams.object);
    $scope.object = obj;

}]);